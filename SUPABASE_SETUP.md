# ⛪ دليل ربط قاعدة بيانات Supabase (Supabase Connection Guide)

هذا الدليل يشرح لك خطوة بخطوة كيفية ربط نظام إدارة الخدمة الكنسية بحسابك وقاعدة بياناتك على **Supabase (PostgreSQL)** بأسهل وأسرع طريقة.

---

## 1. الحصول على بيانات الاتصال من Supabase

1. قم بتسجيل الدخول إلى حسابك على [Supabase Dashboard](https://supabase.com/dashboard).
2. افتح مشروعك (أو أنشئ مشروعاً جديداً مجانياً باسم مثلاً: `church-service`).
3. انتقل من القائمة الجانبية إلى:
   **Project Settings** (أيقونة الترس ⚙️ أسفل اليسار) ⬅️ **Database**.
4. مرر لأسفل حتى قسم **Connection string**، واختر تبويب **URI**:
   - **Pooled connection (Transaction Mode - Port 6543):**
     هذا الرابط يستخدم تقنية Connection Pooling فائقة السرعة للمستقبل والخدمة المتزامنة.
     انسخه وضعه في متغير `DATABASE_URL`.
     *(تأكد من استبدال `[YOUR-PASSWORD]` بكلمة المرور الخاصة بقاعدة بيانات مشروعك)*.
   - **Direct connection (Port 5432):**
     هذا الرابط المباشر يستخدم في ترحيل الجداول (Migrations / Prisma Push).
     انسخه وضعه في متغير `DIRECT_URL`.

---

## 2. إعداد ملف البيئة `.env` في الخادم (`server/.env`)

قم بإنشاء ملف `.env` داخل مجلد `server/` (أو انسخ من `server/.env.example`):

```env
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# رابط الاتصال المجمع (Transaction Mode - Port 6543)
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"

# رابط الاتصال المباشر (Direct Session Mode - Port 5432)
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# مفاتيح Supabase API (تجدها في Project Settings -> API)
SUPABASE_URL="https://[PROJECT-REF].supabase.co"
SUPABASE_ANON_KEY="[YOUR-ANON-KEY]"
SUPABASE_SERVICE_ROLE_KEY="[YOUR-SERVICE-ROLE-KEY]"

# إعدادات الحماية والأمان
JWT_SECRET="church-service-management-super-secret-cryptographic-key-2026"
JWT_EXPIRES_IN="7d"
COOKIE_SECRET="church-service-cookie-secret-2026"
ABSENCE_ALERT_THRESHOLD=2
```

---

## 3. رفع الجداول والبيانات التجريبية إلى Supabase

بمجرد وضع الروابط في `server/.env`، قم بتشغيل الأوامر التالية من المجلد الرئيسي للمشروع:

### أ) توليد عميل Prisma وإنشاء الجداول تلقائياً في Supabase:
```bash
npm run prisma:generate
npm run prisma:push
```
> سيقوم Prisma بإنشاء كافة الجداول الـ 20 (Sectors, Stages, Users, ServedMembers, FollowUpSessions, LessonPreps, SpiritualLifeEntries, AuditLogs...) تلقائياً وبأعلى معايير سلامة البيانات.

### ب) زرع البيانات النموذجية الأولية (Coptic Church Seed):
```bash
npm run prisma:seed
```
> سيقوم هذا الأمر بإنشاء الهيكل الكامل للمراحل (حضانة، ابتدائي، إعدادي بنين/بنات، ثانوي، جامعة)، و 5 حسابات تجريبية للأدوار الهرمية الخمسة، بالإضافة إلى عينات من المخدومين والتحضيرات والإعلانات.

---

## 4. الحسابات التجريبية الجاهزة (Default Password: `Church@2026!`)

| الدور (Role) | الاسم | رقم الهاتف | الصلاحية والنطاق |
|---|---|---|---|
| **أمين عام (General Secretary)** | أ/ نبيل كامل | `01000000001` | صلاحية شاملة على مستوى الكنيسة / نقل وتجميد الخدام |
| **أمين قطاع (Sector Secretary)** | م/ سامح يوسف | `01000000002` | قطاع إعدادي (بنين وبنات) / تقييم أمناء المراحل |
| **أمين الخدمة (Stage Secretary)** | أ/ مينا موريس | `01000000003` | مرحلة إعدادي بنين / تحضيرات، إعلانات، تدبير سنة |
| **مساعد أمين (Assistant)** | أ/ بيتر سمير | `01000000004` | إعدادي بنين / إضافة مخدومين ومتابعة الكشوف |
| **خادم (Servant)** | د/ فادي كمال | `01000000005` | فصل إعدادي بنين / حضور مخدوميه، تحضير، خزنته الروحية |

---

## 5. تشغيل المنظومة محلياً

```bash
# تشغيل الخادم والواجهة معاً:
npm run dev

# أو تشغيل كل طرف بشكل منفصل:
npm run dev:server   # يعمل على http://localhost:5000
npm run dev:client   # يعمل على http://localhost:5173
```
- افتح المتصفح على: `http://localhost:5173`
- يمكنك الضغط على أي زر من أزرار **التجربة الفورية (Quick Demo)** في شاشة تسجيل الدخول للتبديل الفوري بين أدوار النظام الخمسة ورؤية تكيف الواجهة وصلاحيات الأمان التراكمية مباشرة!
