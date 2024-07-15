/** @typedef {import('../options.js').Line} Line */
/** @typedef {import('../options.js').LineOptions} LineOptions */
/** @typedef {import('../options.js').PointsOptions} PointsOptions */
/** @typedef {import("../imports.js").Point} Point */

/**
 * إنشاء كائن مستقيم بناءً على الخيارات المقدمة
 * @param {LineOptions} options @defaultValue { dis: 1, end: 1, spacing: 1, count: 2, neg: false }
 * @returns {Line}
 * @throws إذا كانت الخيارات غير صالحة
 * @example
 * const line = Line.create.one({ end: -10 })
 * // line = { neg: true, count: 2, dis: 10, spacing: 10, end: -10, min: -10, max: 0, points: [0, -10] }
 * @example
 * const line = Line.create.one({ end: -10, count: 3 })
 * // line = { neg: true, count: 3, dis: 10, spacing: 5, end: -10, min: -10, max: 0, points: [0, -5, -10] }
 * @example
 * const line = Line.create.one({ dis: 10, neg: true })
 * // line = { neg: true, count: 2, dis: 10, spacing: 10, end: -10, min: -10, max: 0, points: [0, -10] }
 * @example
 * const line = Line.create.one({ dis: 10, count: 3, neg: true })
 * // line = { neg: true, count: 3, dis: 10, spacing: 5, end: -10, min: -10, max: 0, points: [0, -5, -10] }
 * @example
 * const line = Line.create.one({ spacing: 5, count: 3, neg: true })
 * // line = { neg: true, count: 3, dis: 10, spacing: 5, end: -10, min: -10, max: 0, points: [0, -5, -10] }
 */
export function one({ dis = 1, end = 1, spacing = 1, count = 2, neg = false }) {
  // التحقق من القيم المقدمة
  if (!Number.isNaN(dis) && dis < 0) throw new Error('يجب أن تكون المسافة موجباً')
  if (!Number.isNaN(spacing) && spacing < 0) throw new Error('يجب أن يكون التباعد موجباً')
  if (!Number.isNaN(count) && count < 2) throw new Error('يجب أن يكون عدد النقاط أكبر من أو يساوي 2')

  // تهيئة كائن المستقيم
  const l = {}

  l.neg = end !== undefined ? end < 0 : neg
  l.count = count !== undefined ? count : spacing ? dis / spacing + 1 : 2
  l.dis =
    end !== undefined ? Math.abs(end) : dis !== undefined ? dis : spacing !== undefined ? spacing * (l.count - 1) : 1

  // تعريف الخصائص المحسوبة
  Object.defineProperties(l, {
    spacing: {
      get() {
        return this.dis / (this.count - 1)
      }
    },
    end: {
      get() {
        return this.neg ? -this.dis : this.dis
      }
    },
    min: {
      get() {
        return this.neg ? -this.dis : 0
      }
    },
    max: {
      get() {
        return this.neg ? 0 : this.dis
      }
    },
    points: {
      get() {
        return Array.from({ length: this.count }, (_, i) => this.spacing * i * (this.neg ? -1 : 1))
      }
    }
  })

  // @ts-ignore
  return l
}

/**
 * حساب مواضع جميع النقاط على الخط، مع ضبط اختياري للفواصل
 * @param {PointsOptions} options عدد النقاط @defaultValue { spacing: 1, count: 2, sort: zero }
 * @returns {Point[]} مصفوفة من المواضع لكل نقطة على المستقيم
 * @throws إذا كان الخيار المقدم للترتيب غير صالح
 * @example
 * const points = Line.create.points({ count: 5, spacing: 2, sort: 'zero'})
 * // points = [0, 2, -2, 4, -4] ('zero' sort)
 * // points = [-4, -2, 0, 2, 4] ('neg' sort)
 * // points = [4, 2, 0, -2, -4] ('pos' sort)
 */
export function points({ count = 2, spacing = 1, sort = 'zero' }) {
  // تهيئة مصفوفة لتخزين المواضع المحسوبة لكل نقطة
  /** @type {Point[]} */
  const points = new Array(count)
  // تحديد ما إذا كان العدد الكلي للنقاط زوجياً
  const isEven = count % 2 === 0
  if (!isEven) points[0] = 0

  let j = isEven ? 0 : 1
  const halfSpacing = isEven ? spacing * 0.5 : 0
  // التكرار على كل نقطة لحساب موضعها
  for (let i = j; i < count; i += 2) {
    // حساب موضع النقطة الحالية وتعيينها في المصفوفة
    points[i] = spacing * j + halfSpacing
    points[i + 1] = spacing * -j - halfSpacing

    j++
  }

  // إرجاع المصفوفة التي تحتوي على جميع المواضع المحسوبة
  if (sort === 'zero') return points
  if (sort === 'neg') return points.sort((a, b) => a - b)
  if (sort === 'pos') return points.sort((a, b) => b - a)
  throw new Error('خيار ترتيب غير صالح')
}
