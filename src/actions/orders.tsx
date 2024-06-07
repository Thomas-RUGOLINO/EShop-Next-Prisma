"use server";

import db from "@/db/db";
import OrderHistoryEmail from "@/email/OrderHistory";
import { Resend } from "resend";
import { z } from "zod";


const emailSchema = z.string().email()
const resend= new Resend(process.env.RESEND_API_KEY as string)

export  async function emailOrderHistory (prevState : unknown, formData : FormData): Promise<{message?: string; error?: string}> {


    const result = emailSchema.safeParse(formData.get("email"))

    if (!result.success) {
        return {error: "Invalid email address"}
    }

    const user = await db.user.findUnique({where: {email: result.data}, select :{
        email: true,
        orders : {
            select : {
                id : true,
                createdAt : true,
                pricePaidInCents : true,
                product : {
                    select : {
                        id: true,
                        name : true,
                        description : true,
                        imagePath : true
                    }
                }
            }
        }
    }})

    if (user == null) {
        return {message: "Check your email to view your order history"}
    }
    const orders= user.orders.map(async order => ({
        ...order,
        downloadVerificationId : (await db.downloadVerification.create({   
            data : {
                expiresAt : new Date(Date.now() + 1000*60*60*24),
                productId : order.product.id

            }
        })).id
    }))

    const data = await resend.emails.send({
        from: `Support <${process.env.SENDER_EMAIL}>`,
        to: user.email,
        subject: "Your order history",
        react : <OrderHistoryEmail orders={await Promise.all(orders)}/>
    })

    if (data.error) {
        return {error: "Failed to send email, please try again later"}
    }
    
    return {message: "Check your email to view your order history and download you products with the links provided"}
}   