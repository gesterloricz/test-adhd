import numpy as np
import pandas as pd
from scipy import signal
from scipy.fft import fft
from scipy.io import loadmat
import mne
import io
import tempfile
import os

EEG_CHANNELS = [
    "Fz",
    "Cz",
    "Pz",
    "C3",
    "T3",
    "C4",
    "T4",
    "Fp1",
    "Fp2",
    "F3",
    "F4",
    "F7",
    "F8",
    "P3",
    "P4",
    "T5",
    "T6",
    "O1",
    "O2",
]


class EEGPreprocessor:
    """
    Preprocesses EEG signals following the methodology:
    - Bandpass Butterworth filtering (0.5-50 Hz)
    - Sub-band decomposition
    - Epoch segmentation
    """

    def __init__(self, sampling_rate=128):
        self.sampling_rate = sampling_rate
        self.band_ranges = {
            "delta": (0.5, 4),
            "theta": (4, 8),
            "alpha": (8, 13),
            "beta": (13, 30),
            "gamma": (30, 50),
        }

    def apply_bandpass_filter(self, data, lowcut, highcut, order=5):
        """Apply Butterworth bandpass filter"""
        nyquist = 0.5 * self.sampling_rate
        low = lowcut / nyquist
        high = highcut / nyquist
        b, a = signal.butter(order, [low, high], btype="band")
        return signal.filtfilt(b, a, data)

    def preprocess_signal(self, raw_signal):
        """
        Apply 0.5-50 Hz bandpass filter to all channels
        """
        n_channels = raw_signal.shape[0]
        filtered_signal = np.zeros_like(raw_signal)
        for ch in range(n_channels):
            filtered_signal[ch] = self.apply_bandpass_filter(
                raw_signal[ch], 0.5, 50, order=5
            )
        return filtered_signal

    def create_epochs(self, signal_data, epoch_length=1280, overlap=640):
        """
        Create 10-second epochs with 50% overlap
        """
        n_channels, n_samples = signal_data.shape
        step = epoch_length - overlap
        n_epochs = (n_samples - epoch_length) // step + 1

        epochs = []
        for i in range(n_epochs):
            start = i * step
            end = start + epoch_length
            if end <= n_samples:
                epochs.append(signal_data[:, start:end])
        return np.array(epochs)


class FeatureExtractor:
    """
    Extracts features following Section 2.3:
    - Power Spectral Density (PSD)
    - Spectral Entropy
    Resulting in 190-dimensional feature vector (19 channels x 5 bands x 2 features)
    """

    def __init__(self, sampling_rate=128):
        self.sampling_rate = sampling_rate

    def compute_psd_fft(self, signal_epoch):
        """Compute Power Spectral Density using FFT"""
        N = len(signal_epoch)
        fft_vals = fft(signal_epoch)
        fft_vals = fft_vals[: N // 2]
        psd = (np.abs(fft_vals) ** 2) / (N * self.sampling_rate)
        freqs = np.fft.fftfreq(N, 1 / self.sampling_rate)[: N // 2]
        return freqs, psd

    def compute_band_power(self, signal_epoch, freq_range):
        """Calculate band power (PSD)"""
        freqs, psd = self.compute_psd_fft(signal_epoch)
        idx = np.logical_and(freqs >= freq_range[0], freqs <= freq_range[1])
        if np.sum(idx) == 0:
            return 0.0
        return np.sum(psd[idx])

    def compute_spectral_entropy(self, signal_epoch, freq_range):
        """Calculate spectral entropy"""
        freqs, psd = self.compute_psd_fft(signal_epoch)
        idx = np.logical_and(freqs >= freq_range[0], freqs <= freq_range[1])
        psd_band = psd[idx]

        if len(psd_band) == 0 or np.sum(psd_band) == 0:
            return 0.0

        psd_normalized = psd_band / (np.sum(psd_band) + 1e-10)
        entropy = -np.sum(psd_normalized * np.log(psd_normalized + 1e-10))
        return entropy

    def extract_features_from_epoch(self, epoch_data, band_ranges):
        """
        Extract 190-dimensional feature vector from one epoch
        """
        n_channels = epoch_data.shape[0]
        features = []

        for band_name in ["delta", "theta", "alpha", "beta", "gamma"]:
            freq_range = band_ranges[band_name]
            for ch in range(n_channels):
                band_power = self.compute_band_power(epoch_data[ch], freq_range)
                spec_entropy = self.compute_spectral_entropy(epoch_data[ch], freq_range)
                features.append(band_power)
                features.append(spec_entropy)

        return np.array(features)


def load_eeg_from_bytes(file_bytes: bytes, filename: str) -> np.ndarray:
    """
    Parses the raw file bytes into an EEG numpy array of shape (channels, samples).
    """
    ext = os.path.splitext(filename)[1].lower()

    if ext == ".mat":
        # Load from MAT file
        mat_data = loadmat(io.BytesIO(file_bytes))
        data_keys = [k for k in mat_data.keys() if not k.startswith("__")]
        possible_keys = ["v3p", "data", "EEG", "eeg_data", "signal", "X", "eeg"]
        eeg_data = None

        for key in possible_keys:
            if key in mat_data:
                eeg_data = mat_data[key]
                break

        if eeg_data is None and len(data_keys) > 0:
            eeg_data = mat_data[data_keys[0]]

        if eeg_data is None:
            raise ValueError(f"Could not find EEG data in MAT file. Keys: {data_keys}")

        eeg_data = np.array(eeg_data, dtype=np.float64)

    elif ext == ".csv":
        # Assume columns are channels or rows are channels.
        # usually CSV comes as rows=samples, cols=channels
        df = pd.read_csv(io.BytesIO(file_bytes))

        # Determine if we need to transpose
        if df.shape[1] == 19 and df.shape[0] > 19:
            eeg_data = df.values.T
        elif df.shape[0] == 19 and df.shape[1] > 19:
            eeg_data = df.values
        else:
            # Fallback
            eeg_data = df.values.T

    elif ext == ".edf":
        # MNE requires a file on disk to read EDF
        with tempfile.NamedTemporaryFile(suffix=".edf", delete=False) as tmp:
            tmp.write(file_bytes)
            tmp_path = tmp.name

        try:
            raw = mne.io.read_raw_edf(tmp_path, preload=True, verbose=False)

            # Select channels if available
            ch_names = raw.ch_names
            # Find intersection
            available_channels = [ch for ch in EEG_CHANNELS if ch in ch_names]

            if len(available_channels) == 19:
                raw.pick_channels(available_channels)
                # Reorder to match strictly
                raw.reorder_channels(EEG_CHANNELS)
            else:
                raw.pick_channels(ch_names[: min(19, len(ch_names))])

            eeg_data = (
                raw.get_data() * 1e6
            )  # Convert from Volts to microVolts generally
        finally:
            os.remove(tmp_path)
    else:
        raise ValueError(f"Unsupported file format: {ext}")

    # Ensure channels x samples format
    if eeg_data.shape[0] > eeg_data.shape[1]:
        eeg_data = eeg_data.T

    return eeg_data


def process_file_to_features(
    file_bytes: bytes, filename: str, sampling_rate: int = 128
) -> np.ndarray:
    """
    Take raw file bytes, loads them, preprocesses, and extracts features.
    Returns array of shape (n_epochs, 190).
    """
    # 1. Load Data
    raw_eeg_data = load_eeg_from_bytes(file_bytes, filename)

    # 2. Strict Shape Validation
    if raw_eeg_data.shape[0] != 19:
        raise ValueError(
            f"CRITICAL ERROR: Invalid file format.\nExpected exactly 19 EEG channels, but found {raw_eeg_data.shape[0]}.\nPlease provide a valid EEG recording formatted for the 10-20 system."
        )

    preprocessor = EEGPreprocessor(sampling_rate=sampling_rate)
    feature_extractor = FeatureExtractor(sampling_rate=sampling_rate)

    # 2. Bandpass filtering (0.5-50 Hz)
    preprocessed = preprocessor.preprocess_signal(raw_eeg_data)

    # 3. Epoch segmentation (10s with 50% overlap)
    epochs = preprocessor.create_epochs(preprocessed)

    if len(epochs) == 0:
        raise ValueError("Data too short to create any 10 second epochs.")

    # 4. Feature extraction (PSD + Spectral Entropy)
    all_features = []
    for epoch in epochs:
        features = feature_extractor.extract_features_from_epoch(
            epoch, preprocessor.band_ranges
        )
        all_features.append(features)

    return np.array(all_features)
