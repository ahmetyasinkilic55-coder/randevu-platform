-- CreateIndex
CREATE UNIQUE INDEX "Service_businessId_name_key" ON "services"("businessId", "name");

-- CreateIndex  
CREATE UNIQUE INDEX "Staff_businessId_name_key" ON "staff"("businessId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "GalleryItem_businessId_order_key" ON "gallery_items"("businessId", "order");
