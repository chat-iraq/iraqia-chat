import { useEffect } from 'react'
import { applySeo, injectRoomSchema, removeRoomSchema } from '../utils/seo'

/**
 * تطبيق تحسينات SEO وسمية لكل صفحة.
 * @param {{ title?: string; description?: string; path?: string; room?: null | import('../types').ChatRoom }} opts
 */
export function useSeo(opts) {
  useEffect(() => {
    applySeo(opts)
    if (opts.room) {
      injectRoomSchema(opts.room)
    } else {
      removeRoomSchema()
    }
  }, [opts.title, opts.description, opts.path, opts.room])
}

export default useSeo