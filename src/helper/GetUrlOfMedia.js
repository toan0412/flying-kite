import { storage } from '@/firebase/index.js'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

export async function uploadFilesAndGetUrls(filesToUpload, path) {
  const uploadPromises = filesToUpload.map(async (file) => {
    const storageRef = ref(storage, `${path}/${file.name}`)

    try {
      await uploadBytes(storageRef, file)
      const downloadURL = await getDownloadURL(storageRef)

      return {
        name: file.name,
        url: downloadURL,
        type: file.type
      }
    } catch (error) {
      console.error('Error uploading file:', file.name, error)
      return null
    }
  })

  try {
    const mediaArray = await Promise.all(uploadPromises)
    return mediaArray.filter((item) => item !== null)
  } catch (error) {
    console.error('Error uploading files:', error)
    return []
  }
}
