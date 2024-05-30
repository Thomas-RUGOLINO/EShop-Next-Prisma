"use server";

import db from "@/db/db";
import fs from "fs/promises";
import { notFound, redirect } from "next/navigation";
import {z} from "zod";

const fileSchema = z.instanceof(File, {message: "Required"});
const imageSchema = fileSchema.refine(file => file.size === 0 || file.type.startsWith("image/"));

const addSchema = z.object({
    name: z.string().min(1),
    priceInCents: z.coerce.number().int().min(1),
    description: z.string().min(1),
    file: fileSchema.refine(file => file.size > 0, "Required"),
    image: imageSchema.refine(file => file.size > 0, "Required")

});

export async function addProduct (prevState: unknown, formData: FormData) {
    
    const results = addSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!results.success) {
        return results.error.formErrors.fieldErrors;
    }

    const data = results.data;

    await fs.mkdir("products", {recursive: true});
    const filePath = `products/${crypto.randomUUID()}-${data.file.name}`;
    await fs.writeFile(filePath, Buffer.from(await data.file.arrayBuffer()));

    await fs.mkdir("public/products", {recursive: true});
    const imagePath = `/products/${crypto.randomUUID()}-${data.image.name}`;
    await fs.writeFile(`public${imagePath}`, Buffer.from(await data.image.arrayBuffer()));

    await db.product.create({data: {
        isAvailableForPurchase: false,
        name: data.name,
        PriceInCents: data.priceInCents, // Change property name to 'PriceInCents'
        description: data.description,
        filePath,
        imagePath

    }});

    redirect("/admin/products");
}

const editSchema = addSchema.extend({
    file: fileSchema.optional(),
    image: imageSchema.optional()


});

export async function editProduct (id : string, prevState: unknown, formData: FormData) {
    
    const results = editSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!results.success) {
        return results.error.formErrors.fieldErrors;
    }

    const data = results.data;
    const product = await db.product.findUnique({where: {id}});

    if (product == null) return notFound();

    let filePath = product.filePath;

    if(data.file != null && data.file.size > 0)  {
        await fs.unlink(product.filePath);
        filePath = `products/${crypto.randomUUID()}-${data.file.name}`;
        await fs.writeFile(filePath, Buffer.from(await data.file.arrayBuffer()));
    }

    let imagePath = product.imagePath;
    if(data.image != null && data.image.size > 0) {
        await fs.unlink(`public${product.imagePath}`);
        imagePath = `/products/${crypto.randomUUID()}-${data.image.name}`;
        await fs.writeFile(`public${imagePath}`, Buffer.from(await data.image.arrayBuffer()));
    }
   

    await db.product.update({
        where : {id},
        data: {
        name: data.name,
        PriceInCents: data.priceInCents, // Change property name to 'PriceInCents'
        description: data.description,
        filePath,
        imagePath

    }});

    redirect("/admin/products");
}

export async function toggleProductAvailability (id: string, isAvailableForPurchase: boolean) {
    await db.product.update({where: {id}, data: {isAvailableForPurchase}});
}

export async function deleteProduct (id: string) {
    const product = await db.product.delete({where: {id}});

    if(product == null ) return {error: "Product not found"};
    await fs.unlink(product.filePath);
    await fs.unlink(`public${product.imagePath}`);
}