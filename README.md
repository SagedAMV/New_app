# موقعي (Expo + EAS) — Scaffold

هذا مشروع مُهيأ لاستخدام Expo Managed workflow وEAS لبناء APK/AAB.

خطوات سريعة للمبتدئين:

1) تثبيت الحزم:
   - تأكّد أن لديك Node.js مثبت.
   - افتح الطرفية في مجلد المشروع وشغّل: `npm install`

2) تشغيل التطبيق على جهازك (تطوير):
   - شغّل: `npm run start`
   - ثم اضغط `a` من الطرفية لفتح على أندرويد أو امسح رمز QR عبر تطبيق Expo Go.

3) بناء APK عبر EAS (مُفضّل عندما ترغب بتوليد ملف لتثبيته خارج Expo Go):
   - ثبت eas-cli: `npm install -g eas-cli`
   - سجل دخول: `eas login`
   - ضبّط المشروع مرّة واحدة: `eas build:configure`
   - شغّل بناء development APK: `eas build -p android --profile development`

ملاحظات:
- معرف الحزمة (package id) تم تعيينه إلى `com.sagedamv.moqi` — هذا مهم إذا أردت رفع التطبيق إلى متجر Google Play.
- لإصدار نسخة release للنشر ستحتاج مفتاح توقيع (keystore). يمكنك السماح لـ EAS بإدارة المفتاح تلقائياً أثناء بناء release.

إذا تريد، أستطيع:
- فتح Pull Request بهذه التعديلات.
- إضافة ملف GitHub Actions لبناء تلقائي عبر EAS (ستحتاج لإضافة أسرار EAS_TOKEN وغيرها).
