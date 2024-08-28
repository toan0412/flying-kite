import { createAvatar } from '@dicebear/core'
import { croodles } from '@dicebear/collection'

// Hàm để tạo avatar và chuyển thành Blob
export function generateAvatarBlob(seed) {
    const avatar = createAvatar(croodles, {
        seed: seed,
        backgroundColor: '#ffdbea'
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
