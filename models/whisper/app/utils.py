import librosa
import numpy as np
import pywt
from scipy.spatial.distance import cosine

# 🎵 Extract MFCC + DWT features
def extract_features(y, sr):
    """Extract MFCC and DWT-based speech features."""
    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
    mfcc_features = np.mean(mfcc, axis=1)

    coeffs = pywt.wavedec(y, 'db4', level=3)
    dwt_features = np.hstack([np.mean(c) for c in coeffs])

    return np.hstack([mfcc_features, dwt_features])


# 🧮 Compute acoustic pronunciation score
def compute_acoustic_score(y, sr):
    """
    Basic acoustic scoring: compares two halves of the same signal 
    as a self-similarity baseline (you can replace with ref audio later).
    """
    features_full = extract_features(y, sr)
    half = len(y) // 2
    ref_features = extract_features(y[:half], sr)
    return (1 - cosine(features_full, ref_features)) * 100


# 💬 Optional: text/phoneme-based scoring (simple version)
def compute_phoneme_score(ref_text, pred_text):
    """
    Simple edit-distance-based phoneme/text similarity.
    (Uses text distance here for simplicity, can integrate phonemizer if needed.)
    """
    import editdistance
    distance = editdistance.eval(ref_text.lower(), pred_text.lower())
    return max(0, 100 - distance * 5)  # each wrong phoneme/word reduces score
