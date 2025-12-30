import api from './api'

export const aiAPI = {
  visualSearch: (file, options = {}) => {
    const formData = new FormData()
    formData.append('image', file)
    
    const params = new URLSearchParams()
    if (options.limit) params.append('limit', options.limit)
    if (options.category) params.append('category', options.category)
    
    const url = `/ai/visual-search${params.toString() ? '?' + params.toString() : ''}`
    
    return api.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  
  extractFeatures: (file) => {
    const formData = new FormData()
    formData.append('image', file)
    
    return api.post('/ai/extract-features', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
}

export default aiAPI
