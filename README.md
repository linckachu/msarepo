# msarepo

Cloud Stream için hazırlanan film ve dizi kataloğu. İlk sürüm; responsive ana sayfa, film/dizi filtreleri, arama ve karttan doğrudan açılan HTML5 video oynatıcı içerir.

## Çalıştırma

```bash
npm install
copy .env.example .env.local
npm run dev
```

Uygulama varsayılan olarak `http://localhost:3000` adresinde açılır.

## Dizipal bağlantısı

Uygulama formal bir API kullanmaz. Ana sayfa verisi doğrudan `dizipalw.com` HTML içeriğinden okunur ve beş dakika önbelleğe alınır. Kullanıcı bir karta bastığında `/api/resolve` rotası ilgili Dizipal film/bölüm sayfasını alır, sayfadaki şifreli oynatıcı adresini sunucu tarafında çözer ve yalnızca HTTPS oynatıcıyı arayüze döndürür.

Resolver güvenlik amacıyla yalnızca `https://dizipalw.com/film/*` ve `https://dizipalw.com/dizi/*` adreslerini kabul eder; genel amaçlı URL getirme/proxy davranışı yoktur.

Kaynak sayfa veya oynatıcı şeması değişirse `src/lib/dizipal.ts` güncellenmelidir. Üçüncü taraf oynatıcı alan adındaki Cloudflare/IP kuralları ayrıca erişime izin vermelidir.

## Komutlar

- `npm run dev` — geliştirme sunucusu
- `npm run build` — üretim derlemesi
- `npm run start` — üretim sunucusu
- `npm run lint` — kod denetimi

## CloudStream deposu

`MsaRepoProvider` klasörü TV ve Android için CloudStream eklentisini içerir. GitHub'a `main` dalı olarak yüklendiğinde `CloudStream Build` işlemi eklentiyi otomatik derler ve `builds` dalına yayınlar.

Depo adresi:

```text
https://raw.githubusercontent.com/linkachu/msarepo/builds/repo.json
```

CloudStream'da tam adres doğrudan eklenebilir. TV'de kısa kod kullanmak için bu adres `cutt.ly` üzerinde kısaltılır ve `https://cutt.ly/` sonrasındaki kod CloudStream'ın depo ekleme alanına yazılır.

Yerel eklenti derlemesi:

```powershell
.\gradlew.bat MsaRepoProvider:make makePluginsJson
```
