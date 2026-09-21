const { supabaseAdmin } = require('../src/config/supabase');

const categories = [
  {
    name: 'Gorras clásicas',
    slug: 'gorras-clasicas',
    description: 'Diseños urbanos atemporales para todos los días.',
    active: true,
  },
  {
    name: 'Snapback',
    slug: 'snapback',
    description: 'Gorras de visera plana con ajuste trasero regulable.',
    active: true,
  },
  {
    name: 'Five panel',
    slug: 'five-panel',
    description: 'Modelos ligeros de cinco paneles para un look streetwear.',
    active: true,
  },
];

const products = [
  {
    name: 'Crown Essential Negra',
    slug: 'crown-essential-negra',
    description: 'Gorra clásica negra con bordado Urban Crown en relieve.',
    price: 19990,
    compare_price: 24990,
    sku: 'UC-CL-001',
    stock: 24,
    image: 'https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=900&q=85',
    active: true,
    categorySlug: 'gorras-clasicas',
  },
  {
    name: 'Crown Essential Beige',
    slug: 'crown-essential-beige',
    description: 'Gorra de algodón beige con logo frontal minimalista.',
    price: 19990,
    compare_price: null,
    sku: 'UC-CL-002',
    stock: 18,
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=900&q=85',
    active: true,
    categorySlug: 'gorras-clasicas',
  },
  {
    name: 'Metro Snapback Verde',
    slug: 'metro-snapback-verde',
    description: 'Snapback verde bosque con parche tejido y visera plana.',
    price: 22990,
    compare_price: 27990,
    sku: 'UC-SB-001',
    stock: 15,
    image: 'https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?auto=format&fit=crop&w=900&q=85',
    active: true,
    categorySlug: 'snapback',
  },
  {
    name: 'Metro Snapback Burdeos',
    slug: 'metro-snapback-burdeos',
    description: 'Snapback burdeos con detalle bordado y cierre ajustable.',
    price: 22990,
    compare_price: null,
    sku: 'UC-SB-002',
    stock: 11,
    image: 'https://images.unsplash.com/photo-1572307480813-ceb0e59d8325?auto=format&fit=crop&w=900&q=85',
    active: true,
    categorySlug: 'snapback',
  },
  {
    name: 'Transit Five Panel Gris',
    slug: 'transit-five-panel-gris',
    description: 'Five panel gris grafito, liviana y lista para la ciudad.',
    price: 18990,
    compare_price: null,
    sku: 'UC-FP-001',
    stock: 20,
    image: 'https://images.unsplash.com/photo-1529958030586-3aae4ca485ff?auto=format&fit=crop&w=900&q=85',
    active: true,
    categorySlug: 'five-panel',
  },
  {
    name: 'Transit Five Panel Azul',
    slug: 'transit-five-panel-azul',
    description: 'Five panel azul marino con cordón frontal y logo discreto.',
    price: 18990,
    compare_price: 21990,
    sku: 'UC-FP-002',
    stock: 3,
    image: 'https://images.unsplash.com/photo-1514327605112-b887c0e61c0a?auto=format&fit=crop&w=900&q=85',
    active: true,
    categorySlug: 'five-panel',
  },
  {
    name: 'Crown Corduroy Café',
    slug: 'crown-corduroy-cafe',
    description: 'Gorra de pana café con textura premium y visera curva.',
    price: 24990,
    compare_price: null,
    sku: 'UC-CL-003',
    stock: 9,
    image: 'https://images.unsplash.com/photo-1572307480813-ceb0e59d8325?auto=format&fit=crop&w=900&q=85',
    active: true,
    categorySlug: 'gorras-clasicas',
  },
  {
    name: 'Urban Crown All Black',
    slug: 'urban-crown-all-black',
    description: 'Snapback completamente negra para combinar con todo.',
    price: 23990,
    compare_price: null,
    sku: 'UC-SB-003',
    stock: 14,
    image: 'https://images.unsplash.com/photo-1556306535-0f09a537f0a3?auto=format&fit=crop&w=900&q=85',
    active: true,
    categorySlug: 'snapback',
  },
];

async function upsertBySlug(table, item) {
  const { categorySlug, ...record } = item;
  const { data: existing, error: findError } = await supabaseAdmin
    .from(table)
    .select('id')
    .eq('slug', record.slug)
    .maybeSingle();

  if (findError) throw findError;

  if (existing) {
    const { data, error } = await supabaseAdmin
      .from(table)
      .update(record)
      .eq('id', existing.id)
      .select()
      .single();
    if (error) throw error;
    return { data, action: 'updated' };
  }

  const { data, error } = await supabaseAdmin.from(table).insert(record).select().single();
  if (error) throw error;
  return { data, action: 'created' };
}

async function seed() {
  const categoryIds = {};

  for (const category of categories) {
    const result = await upsertBySlug('categories', category);
    categoryIds[category.slug] = result.data.id;
    console.log(`${result.action} category: ${category.name}`);
  }

  for (const product of products) {
    const result = await upsertBySlug('products', {
      ...product,
      category_id: categoryIds[product.categorySlug],
    });
    console.log(`${result.action} product: ${product.name}`);
  }

  console.log(`Catalog loaded: ${products.length} urban caps in ${categories.length} categories.`);
}

seed().catch((error) => {
  console.error('Catalog seed failed:', error.message);
  process.exitCode = 1;
});
