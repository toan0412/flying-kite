import { createAvatar } from '@dicebear/core'
import { initials } from '@dicebear/collection'
import { shapes } from '@dicebear/collection'

// Hàm để tạo avatar và chuyển thành Blob
export function generateAvatarBlob(seed, type) {
  const typeAvatar = type === 'user' ? initials : shapes
  const avatar = createAvatar(typeAvatar, {
    seed: seed,
    backgroundColor: [
      '5D9CEC', // Xanh dương
      '8C9EFF', // Xanh tím nhạt
      '4DB6AC', // Xanh ngọc
      'FF8A65', // Cam đào
      'F06292', // Hồng
      '7986CB', // Xanh tím đậm
      'FFA726', // Cam
      '4DD0E1', // Xanh lơ
      'BA68C8', // Tím
      '81C784' // Xanh lá
    ],
    backgroundType: ['gradientLinear'],
    fontSize: 36
  })

  const dataURL = avatar.toDataUri()

  // Chuyển đổi Data URI thành Blob
  const [header, encoded] = dataURL.split(',')
  const mime = header.match(/:(.*?);/)[1]

  // Xử lý mã hóa utf8 cho SVG
  const decoded = decodeURIComponent(encoded)
  const blob = new Blob([decoded], { type: mime })

  return blob
}
