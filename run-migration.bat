# Blog posts tablosu için migration oluştur
npx prisma migrate dev --name add-blog-posts

# Sonra client'ı yeniden generate et
npx prisma generate
