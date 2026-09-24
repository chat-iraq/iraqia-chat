/**
 * الأنواع العامة للتطبيق (JSDoc typedefs)
 */

/**
 * @typedef {Object} ChatMessage
 * @property {string} id
 * @property {string} room - slug الغرفة
 * @property {string} author - اسم المستخدم
 * @property {string} text - نص الرسالة
 * @property {number} ts - طابع زمني
 * @property {boolean} own - هل هي رسالة المستخدم؟
 * @property {boolean} system - هل هي رسالة نظام؟
 */

/**
 * @typedef {Object} ChatRoom
 * @property {string} slug
 * @property {string} name
 * @property {string} title
 * @property {string} description
 * @property {string} region
 * @property {string} emoji
 * @property {string} tag
 * @property {number} online
 * @property {boolean} featured
 */

/**
 * @typedef {Object} AmbientUser
 * @property {string} name
 * @property {string} emoji
 */

const ROOM_TAG = 'room'

export { ROOM_TAG }

export default {}