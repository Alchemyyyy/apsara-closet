from PIL import Image
import numpy as np
from pathlib import Path

class ImageProcessor:
    """Process images for AI model"""
    
    def __init__(self):
        self.target_size = (224, 224)
        self.allowed_formats = ['JPEG', 'PNG', 'JPG', 'WEBP']
    
    def process_image(self, image_path: str) -> np.ndarray:
        """
        Load and preprocess image for model
        
        Args:
            image_path: Path to image file
            
        Returns:
            numpy array of shape (224, 224, 3)
        """
        try:
            # Open image
            img = Image.open(image_path)
            
            # Convert to RGB (remove alpha channel if present)
            if img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Resize to target size
            img = img.resize(self.target_size, Image.Resampling.LANCZOS)
            
            # Convert to numpy array
            img_array = np.array(img, dtype=np.float32)
            
            # Ensure correct shape
            if img_array.shape != (224, 224, 3):
                raise ValueError(f"Invalid image shape: {img_array.shape}")
            
            return img_array
            
        except Exception as e:
            print(f"❌ Image processing failed: {str(e)}")
            raise
    
    def validate_image(self, image_path: str) -> bool:
        """
        Validate if file is a valid image
        
        Args:
            image_path: Path to image file
            
        Returns:
            True if valid, False otherwise
        """
        try:
            img = Image.open(image_path)
            
            # Check format
            if img.format not in self.allowed_formats:
                return False
            
            # Check size (must be reasonable)
            width, height = img.size
            if width < 50 or height < 50:
                return False
            
            if width > 5000 or height > 5000:
                return False
            
            return True
            
        except Exception:
            return False
