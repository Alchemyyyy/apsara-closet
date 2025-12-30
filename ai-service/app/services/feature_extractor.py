import numpy as np
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
from tensorflow.keras.models import Model
import tensorflow as tf

class FeatureExtractor:
    """Extract features from images using pre-trained MobileNetV2"""
    
    def __init__(self):
        self.model = None
        self.model_name = "MobileNetV2"
        self.input_shape = (224, 224, 3)
        self.feature_size = 1280
        
    def load_model(self):
        """Load pre-trained MobileNetV2 model"""
        try:
            print("📦 Loading MobileNetV2 model...")
            
            # Load MobileNetV2 without top layer
            base_model = MobileNetV2(
                weights='imagenet',
                include_top=False,
                pooling='avg',
                input_shape=self.input_shape
            )
            
            # Use the model directly (already has global average pooling)
            self.model = base_model
            
            print(f"✅ Model loaded: {self.model_name}")
            print(f"   Feature vector size: {self.feature_size}")
            
        except Exception as e:
            print(f"❌ Failed to load model: {str(e)}")
            raise
    
    def extract_features(self, image_array):
        """
        Extract feature vector from image
        
        Args:
            image_array: numpy array of shape (224, 224, 3)
            
        Returns:
            numpy array of shape (1280,) - feature vector
        """
        if self.model is None:
            raise ValueError("Model not loaded. Call load_model() first.")
        
        try:
            # Add batch dimension
            image_batch = np.expand_dims(image_array, axis=0)
            
            # Preprocess for MobileNetV2
            preprocessed = preprocess_input(image_batch)
            
            # Extract features
            features = self.model.predict(preprocessed, verbose=0)
            
            # Return flattened feature vector
            return features.flatten()
            
        except Exception as e:
            print(f"❌ Feature extraction failed: {str(e)}")
            raise
    
    def extract_features_batch(self, image_arrays):
        """
        Extract features from multiple images at once
        
        Args:
            image_arrays: list of numpy arrays
            
        Returns:
            numpy array of shape (n_images, 1280)
        """
        if self.model is None:
            raise ValueError("Model not loaded. Call load_model() first.")
        
        try:
            # Stack images
            image_batch = np.stack(image_arrays, axis=0)
            
            # Preprocess
            preprocessed = preprocess_input(image_batch)
            
            # Extract features
            features = self.model.predict(preprocessed, verbose=0)
            
            return features
            
        except Exception as e:
            print(f"❌ Batch feature extraction failed: {str(e)}")
            raise
