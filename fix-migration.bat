# Shadow database sorununu çöz ve migration çalıştır
npx prisma migrate reset
npx prisma migrate dev --name add-blog-posts
npx prisma generate
