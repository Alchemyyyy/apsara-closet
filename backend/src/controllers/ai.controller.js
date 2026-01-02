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
    console.log('   File path:', req.file.path)
    console.log('   File exists:', fs.existsSync(req.file.path))
    console.log('   AI Service URL:', AI_SERVICE_URL)

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
    
    console.log('🔗 Calling:', url)

    // Forward to AI service
    let response
    try {
      response = await axios.post(url, formData, {
        headers: formData.getHeaders(),
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        timeout: 60000, // 60 second timeout
      })
      
      console.log('✅ AI Service responded successfully')
      console.log('   Results count:', response.data.results?.length || 0)
      
    } catch (aiError) {
      console.error('❌ AI Service Error Details:')
      console.error('   Message:', aiError.message)
      console.error('   Code:', aiError.code)
      console.error('   Status:', aiError.response?.status)
      console.error('   Response data:', JSON.stringify(aiError.response?.data, null, 2))
      
      // Clean up file
      if (req.file?.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path)
      }
      
      // Return detailed error
      if (aiError.code === 'ECONNREFUSED') {
        return res.status(503).json({ 
          error: 'AI service is not running',
          details: `Cannot connect to ${AI_SERVICE_URL}`,
          suggestion: 'Start the AI service: cd ai-service && python run.py'
        })
      }
      
      if (aiError.response?.status === 500) {
        return res.status(500).json({ 
          error: 'AI service internal error',
          details: aiError.response?.data?.detail || aiError.message,
          aiResponse: aiError.response?.data
        })
      }
      
      return res.status(500).json({ 
        error: 'Failed to communicate with AI service',
        details: aiError.message,
        code: aiError.code,
        aiResponse: aiError.response?.data
      })
    }

    // Clean up uploaded file
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path)
      console.log('🗑️  Cleaned up:', req.file.filename)
    }

    console.log('✅ Visual search completed:', response.data.results?.length, 'results')

    res.json(response.data)
    
  } catch (error) {
    console.error('❌ Visual search controller error:')
    console.error('   Type:', error.constructor.name)
    console.error('   Message:', error.message)
    console.error('   Stack:', error.stack)
    
    // Clean up file if exists
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path)
    }

    res.status(500).json({ 
      error: 'Visual search failed',
      details: error.message,
      type: error.constructor.name
    })
  }
}

// Extract features (for testing)
export const extractFeatures = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' })
    }

    console.log('🔍 Extracting features for:', req.file.filename)

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
        timeout: 30000,
      }
    )

    // Clean up uploaded file
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path)
    }

    console.log('✅ Features extracted:', response.data.feature_vector_size, 'dimensions')

    res.json(response.data)
    
  } catch (error) {
    console.error('❌ Feature extraction error:')
    console.error('   Message:', error.message)
    console.error('   Response:', error.response?.data)
    
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path)
    }

    res.status(500).json({ 
      error: 'Feature extraction failed',
      details: error.response?.data?.detail || error.message 
    })
  }
}

// Health check
export const checkAIServiceHealth = async (req, res) => {
  try {
    const response = await axios.get(`${AI_SERVICE_URL}/health`, {
      timeout: 5000
    })
    
    res.json({
      status: 'connected',
      ai_service: response.data,
      url: AI_SERVICE_URL
    })
    
  } catch (error) {
    res.status(503).json({
      status: 'disconnected',
      error: error.message,
      url: AI_SERVICE_URL,
      suggestion: 'Make sure AI service is running'
    })
  }
}