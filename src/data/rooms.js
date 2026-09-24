/**
 * بيانات غرف الدردشة — محافظات وتصنيفات عراقية
 * @type {import('../types').ChatRoom[]}
 */
export const rooms = [
  { slug: 'baghdad', name: 'بغداد', title: 'شات بغداد — غرفة دردشة أهالي العاصمة', description: 'التقِ بنشامى بغداد وبناتها، دردشة حية ومنوّعة على مدار الساعة.', region: 'بغداد', emoji: '🏙️', tag: 'محافظات', online: 214, featured: true },
  { slug: 'basrah', name: 'البصرة', title: 'شات البصرة — دردشة أهل الجنوب', description: 'دردشة أهل البصرة الفيحاء، حوارات ساخرة وعذبة بروح الجنوب.', region: 'البصرة', emoji: '🌴', tag: 'محافظات', online: 168, featured: true },
  { slug: 'mosul', name: 'الموصل', title: 'شات الموصل — غرفة دردشة نينوى', description: 'غرفة نينوى تجمع شباب وبنات الموصل في نقاش ودّي وتعارف.', region: 'الموصل', emoji: '🕌', tag: 'محافظات', online: 142, featured: true },
  { slug: 'erbil', name: 'أربيل', title: 'شات أربيل — دردشة عاصمة كردستان', description: 'غرفة أربيل للتعارف والنقاش من قلب عاصمة إقليم كردستان.', region: 'أربيل', emoji: '🏞️', tag: 'إقليم كردستان', online: 98, featured: true },
  { slug: 'sulaymaniyah', name: 'السليمانية', title: 'شات السليمانية — دردشة السليمانية للبنات والشباب', description: 'غرفة السليمانية: ثقافة، فن، وطاقات شبابية من قلب كردستان.', region: 'السليمانية', emoji: '⛰️', tag: 'إقليم كردستان', online: 87, featured: true },
  { slug: 'kirkuk', name: 'كركوك', title: 'شات كركوك — غرفة الدردشة العراقية', description: 'شباب وبنات كركوك في غرفة واحدة: حوارات عربية وتركمانية وكردية.', region: 'كركوك', emoji: '🛢️', tag: 'محافظات', online: 76 },
  { slug: 'najaf', name: 'النجف', title: 'شات النجف الأشرف — دردشة أهل النجف', description: 'غرفة النجف الأشرف للتعارف والنقاش الهادف بين أهالي المدينة.', region: 'النجف', emoji: '🕋', tag: 'محافظات', online: 59, featured: true },
  { slug: 'karbala', name: 'كربلاء', title: 'شات كربلاء — غرفة دردشة المدينة المقدسة', description: 'غرفة كربلاء المقدسة: نقاش راقٍ وتعريف متبادل بروح المحبة.', region: 'كربلاء', emoji: '🌺', tag: 'محافظات', online: 64 },
  { slug: 'nasiriyah', name: 'الناصرية', title: 'شات الناصرية — دردشة ذي قار', description: 'دردشة أهل الناصرية وعشاق الأهوار وتاريخ ذي قار العريق.', region: 'ذي قار', emoji: '🏜️', tag: 'محافظات', online: 47 },
  { slug: 'amarah', name: 'العمارة', title: 'شات العمارة — غرفة دردشة ميسان', description: 'غرفة ميسان والعمارة، شباب وبنات الجنوب الشرقي.', region: 'ميسان', emoji: '💧', tag: 'محافظات', online: 41 },
  { slug: 'diwaniyah', name: 'الديوانية', title: 'شات الديوانية — دردشة القادسية', description: 'عنوان الديوانية: حوارات وأهل الكرم من محافظة القادسية.', region: 'القادسية', emoji: '🌾', tag: 'محافظات', online: 38 },
  { slug: 'hillah', name: 'الحلة', title: 'شات الحلة — دردشة بابل', description: 'غرفة بابل تجمع أهالي الحلة بالذكريات والطرفة العامرة.', region: 'بابل', emoji: '🐘', tag: 'محافظات', online: 44 },
  { slug: 'kut', name: 'الكوت', title: 'شات الكوت — غرفة دردشة واسط', description: 'دردشة أهالي الكوت وواسط على ضفاف نهر دجلة.', region: 'واسط', emoji: '⛲', tag: 'محافظات', online: 29 },
  { slug: 'samarra', name: 'سامراء', title: 'شات سامراء — دردشة صلاح الدين', description: 'غرفة سامراء والملوية الشهيدة، حوارات من قلب صلاح الدين.', region: 'صلاح الدين', emoji: '🕌', tag: 'محافظات', online: 23 },
  { slug: 'ramadi', name: 'الرمادي', title: 'شات الرمادي — دردشة الأنبار', description: 'غرفة الأنبار: شباب وبنات الرمادي والفلوجة في نبض واحد.', region: 'الأنبار', emoji: '🌵', tag: 'محافظات', online: 34 },
  { slug: 'tikrit', name: 'تكريت', title: 'شات تكريت — غرفة دردشة صلاح الدين', description: 'غرفة تكريت، جلسات طقطقة وضيافة بنكهة تكريتية.', region: 'صلاح الدين', emoji: '🌇', tag: 'محافظات', online: 18 },
  { slug: 'dahuk', name: 'دهوك', title: 'شات دهوك — دردشة كردستان الشمال', description: 'غرفة دهوك بجمال طبيعتها وفنّ شعبي أصيل.', region: 'دهوك', emoji: '🏔️', tag: 'إقليم كردستان', online: 31 },
  { slug: 'halabja', name: 'حلبجة', title: 'شات حلبجة — غرفة دردشة كردستان', description: 'دردشة أهل حلبجة، المدينة التي عادت للحياة.', region: 'حلبجة', emoji: '🌷', tag: 'إقليم كردستان', online: 14 },

  { slug: 'love', name: 'حب وعشق', title: 'شات الحب — تعارف جاد وأحاسيس', description: 'غرفة من يبحث عن قصة حب عراقية صادقة، رومانسية بلا حدود.', region: 'عام', emoji: '💞', tag: 'تعارف', online: 189, featured: true },
  { slug: 'friends', name: 'صداقة', title: 'شات الصداقة — تعرف على أصدقاء جدد', description: 'ابحث عن رفقة صادقة تضحك معك وتبادل الأحاديث اليومية.', region: 'عام', emoji: '🤝', tag: 'تعارف', online: 156, featured: true },
  { slug: 'girls', name: 'بنات العراق', title: 'شات بنات العراق — دردشة خاصة للبنات', description: 'مساحة آمنة لبنات العراق للحوار وتبادل الخبرات بحرية.', region: 'عام', emoji: '👧', tag: 'خاص', online: 173 },
  { slug: 'teens', name: 'شباب وشابات', title: 'شات الشباب — موضة، موسيقى، وطموح', description: 'غرفة الشباب لكل ما يخص طاقات الجيل: رياضة وطموح وحلم.', region: 'عام', emoji: '🧢', tag: 'عام', online: 134 },
  { slug: 'music', name: 'موسيقى وفن', title: 'شات الموسيقى — طرب وأغانٍ عراقية', description: 'غرفة عشّاق الطرب العراقي: من المقسوم إلى الجبوري.', region: 'عام', emoji: '🎸', tag: 'هوايات', online: 72 },
  { slug: 'sports', name: 'رياضة', title: 'شات الرياضة — كرة ومدرجات', description: 'نقاشات الكرة والمنتخبات والأندية العراقية بحماس المشجعين.', region: 'عام', emoji: '⚽', tag: 'هوايات', online: 95 },
  { slug: 'gaming', name: 'ألعاب', title: 'شات الألعاب — غرف لاعبي العراق', description: 'غرفة جيمرز العراق: تجمعات، دلائل، وشركات لعب جماعية.', region: 'عام', emoji: '🎮', tag: 'هوايات', online: 118 },
  { slug: 'students', name: 'طلاب وطالبات', title: 'شات الطلبة — عش الطلاب العراقيين', description: 'غرفة الطلبة: مذكرات، امتحانات، ومناقشات جامعية.', region: 'عام', emoji: '📚', tag: 'عام', online: 63 },
  { slug: 'abroad', name: 'عراقيون المغترب', title: 'شات العراقيين بالخارج — دردشة المغتربين', description: 'وطن يجمع العراقيين في المهجر للمواساة والتشاور والحنين.', region: 'خارج العراق', emoji: '✈️', tag: 'مغتربين', online: 88 },
  { slug: 'jokes', name: 'نكات وطقطقة', title: 'شات النكات — ضحك وسوالف حلوة', description: 'غرفة الضحك والفرفشة، أطرف نكات وسوالف من كل محافظات العراق.', region: 'عام', emoji: '😄', tag: 'عام', online: 107 },
  { slug: 'general', name: 'الغرفة العامة', title: 'شات العراق العام — الدردشة الرئيسية', description: 'الغرفة الرئيسية بمختلف الأطياف والمحافظات، أحاديث لا تتوقف.', region: 'كل العراق', emoji: '🗨️', tag: 'رئيسية', online: 312, featured: true },
  { slug: 'night', name: 'سهرة وليل', title: 'شات السهرة — دردشة مابعد منتصف الليل', description: 'غرفة السهرانين، حوارات عميقة وطاقة ليلية هادئة.', region: 'عام', emoji: '🌙', tag: 'عام', online: 81 },
]

export const featuredRooms = rooms.filter((r) => r.featured)
export const regionTags = [...new Set(rooms.map((r) => r.tag))]

export function getRoom(slug) {
  return rooms.find((r) => r.slug === slug)
}

export function roomsByTag(tag) {
  return rooms.filter((r) => r.tag === tag)
}

export function searchRooms(query) {
  const q = query.trim()
  if (!q) return rooms
  const norm = q.replace(/\s+/g, '')
  return rooms.filter(
    (r) => r.name.includes(q) || r.region.includes(q) || r.description.includes(q) || r.slug.includes(norm),
  )
}