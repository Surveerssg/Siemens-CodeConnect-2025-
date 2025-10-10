import librosa
import numpy as np
import pywt
from scipy.spatial.distance import cosine
import editdistance # Moved import here to avoid repeated loading (Optimization)

# 🎵 Extract MFCC + DWT features
def extract_features(y, sr):
    """Extract MFCC and DWT-based speech features."""
    
    # 1. MFCC Features: Standard 13-coefficient extraction.
    # Added explicit hop_length for consistent frame size (512 is standard)
    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13, hop_length=512) 
    mfcc_features = np.mean(mfcc, axis=1)

    # 2. DWT Features: Using 'db4' level 3.
    # Used 'smooth' mode for potentially faster boundary handling.
    coeffs = pywt.wavedec(y, 'db4', level=3, mode='smooth') 
    
    # Efficient calculation of mean across all coefficient levels
    dwt_features = np.array([np.mean(c) for c in coeffs]) 

    return np.hstack([mfcc_features, dwt_features])


# 🧮 Compute acoustic pronunciation score (Optimized)
def compute_acoustic_score(y, sr):
    """
    Basic acoustic scoring: compares two halves of the same signal 
    as a self-similarity baseline (you can replace with ref audio later).
    
    NOTE: The core inefficiency (extracting features for the full signal AND the half)
    is maintained here to preserve the original function's logic.
    For best performance, this function should be restructured to accept 
    a separate reference audio 'y_ref' and test audio 'y_test'.
    """
    half = len(y) // 2
    
    # Extract features for the full signal
    features_full = extract_features(y, sr) 
    
    # Extract features for the reference segment (the first half)
    ref_features = extract_features(y[:half], sr) 

    # Compute similarity (1 - distance) and scale to 100
    return (1 - cosine(features_full, ref_features)) * 100


# 💬 Optional: text/phoneme-based scoring (simple version)
def compute_phoneme_score(ref_text, pred_text):
    """
    Simple edit-distance-based phoneme/text similarity.
    (Uses text distance here for simplicity, can integrate phonemizer if needed.)
    """
    # editdistance is fast, no further optimization needed.
    distance = editdistance.eval(ref_text.lower(), pred_text.lower())
    
    # Calculate score, ensuring it does not drop below 0
    score = 100 - distance * 5
    return max(0, score)
