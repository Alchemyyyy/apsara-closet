import axios from 'axios'
import FormData from 'form-data'
import fs from 'fs'

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000'

// Visual search
export const visualSearch = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' })
    }

    console.log('📸 Forwarding image to AI service:', req.file.filename)

    // Create form data to send to AI service
    const formData = new FormData()
    formData.append('file', fs.createReadStream(req.file.path), {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    })

    // Add query parameters
    const limit = req.query.limit || 10
    const category = req.query.category || null

    const url = `${AI_SERVICE_URL}/visual-search?limit=${limit}${category ? `&category=${category}` : ''}`

    // Forward to AI service
    const response = await axios.post(url, formData, {
      headers: formData.getHeaders(),
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    })

    // Clean up uploaded file
    fs.unlinkSync(req.file.path)

    console.log('✅ Visual search completed:', response.data.results?.length, 'results')

    res.json(response.data)
  } catch (error) {
    console.error('Visual search error:', error.message)
    
    // Clean up file if exists
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path)
    }

    res.status(500).json({ 
      error: 'Visual search failed',
      details: error.response?.data || error.message 
    })
  }
}

// Extract features (for testing)
export const extractFeatures = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' })
    }

    const formData = new FormData()
    formData.append('file', fs.createReadStream(req.file.path), {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    })

    const response = await axios.post(
      `${AI_SERVICE_URL}/extract-features`,
      formData,
      {
        headers: formData.getHeaders(),
      }
    )

    // Clean up uploaded file
    fs.unlinkSync(req.file.path)

    res.json(response.data)
  } catch (error) {
    console.error('Feature extraction error:', error)
    
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path)
    }

    res.status(500).json({ 
      error: 'Feature extraction failed',
      details: error.response?.data || error.message 
    })
  }
}
