import { XMLParser } from 'fast-xml-parser';
import { HttpError } from '../utils/httpError';
import { createProductRecord, parseProductInput } from './product';

const PRODUCT_IMPORT_SAMPLE = `<?xml version="1.0" encoding="UTF-8"?>
<products>
  <product>
    <name>Oxford Shirt</name>
    <description>Cotton oxford shirt with a button-down collar</description>
    <price>59.00</price>
    <collection>Shirts</collection>
    <modelDetail>Model is 180cm and wears size M</modelDetail>
    <isPublic>true</isPublic>
    <gender>men</gender>
    <collectionType>men</collectionType>
    <type>summer</type>
    <onSale>true</onSale>
    <discountPercent>10</discountPercent>
    <inStock>true</inStock>
    <variants>
      <variant>
        <color>#112233</color>
        <images>
          <image>https://example.com/oxford-navy.jpg</image>
        </images>
        <sizes>
          <size>
            <label>M</label>
            <stockCount>8</stockCount>
          </size>
          <size>
            <label>L</label>
            <stockCount>4</stockCount>
          </size>
        </sizes>
      </variant>
    </variants>
  </product>
</products>
`;

const parser = new XMLParser({
  ignoreAttributes: true,
  trimValues: true,
  parseTagValue: true,
  isArray: (tagName) => ['product', 'variant', 'image', 'size'].includes(tagName),
});

const asList = (value: unknown): unknown[] => {
  if (value === undefined || value === null || value === '') return [];
  return Array.isArray(value) ? value : [value];
};

const mapXmlProduct = (node: Record<string, unknown>) => {
  const variantsNode = node.variants as { variant?: unknown } | undefined;
  const variants = asList(variantsNode?.variant).map((variant) => {
    const record = (variant ?? {}) as Record<string, unknown>;
    const imagesNode = record.images as { image?: unknown } | undefined;
    const sizesNode = record.sizes as { size?: unknown } | undefined;
    return {
      color: record.color,
      images: asList(imagesNode?.image).map((image) => String(image)),
      sizes: asList(sizesNode?.size).map((size) => {
        const sizeRecord = (size ?? {}) as Record<string, unknown>;
        return {
          size: sizeRecord.label,
          stockCount: sizeRecord.stockCount,
        };
      }),
    };
  });

  return {
    name: node.name,
    description: node.description,
    price: node.price,
    collection: node.collection,
    modelDetail: node.modelDetail,
    isPublic: node.isPublic,
    gender: node.gender,
    collectionType: node.collectionType,
    type: node.type,
    onSale: node.onSale,
    discountPercent: node.discountPercent,
    inStock: node.inStock,
    variants,
  };
};

const importProductsFromXml = async (xml: string) => {
  let parsed: { products?: { product?: unknown } };
  try {
    parsed = parser.parse(xml);
  } catch {
    throw new HttpError(422, 'The file is not valid XML');
  }

  const nodes = asList(parsed?.products?.product);
  if (!nodes.length) {
    throw new HttpError(422, 'The XML file does not contain any product entries');
  }

  const created = [];
  const failed: { index: number; name: string; message: string }[] = [];

  for (const [index, node] of nodes.entries()) {
    const record = (node ?? {}) as Record<string, unknown>;
    const name = typeof record.name === 'string' ? record.name : '';
    try {
      const input = parseProductInput(mapXmlProduct(record));
      created.push(await createProductRecord(input));
    } catch (error) {
      failed.push({
        index: index + 1,
        name,
        message: error instanceof HttpError ? error.message : 'Could not save this product',
      });
    }
  }

  return { createdCount: created.length, failedCount: failed.length, created, failed };
};

export { PRODUCT_IMPORT_SAMPLE, importProductsFromXml };
