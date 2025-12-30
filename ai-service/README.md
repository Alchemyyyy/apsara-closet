# Apsara Closet AI Service

AI-powered visual search service for fashion products.

## Features

- Visual product search using deep learning
- Feature extraction using MobileNetV2
- Similarity matching with cosine similarity
- Fast and efficient on M4 Mac

## Setup
```bash
# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run service
python run.py
```

## API Endpoints

- `GET /` - Health check
- `POST /visual-search` - Upload image and find similar products
- `POST /extract-features` - Extract features from image (testing)

## Tech Stack

- FastAPI - Web framework
- TensorFlow - Deep learning
- MobileNetV2 - Feature extraction model
- scikit-learn - Similarity calculations
