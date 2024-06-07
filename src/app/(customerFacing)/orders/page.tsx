"use client";

import { emailOrderHistory } from "@/actions/orders";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFormState, useFormStatus } from "react-dom";

export default function MyOrdersPage () {

    const [data, action] = useFormState(emailOrderHistory, {})

    return (
        <form action={action} className="max-2-xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>My Orders</CardTitle>
                    <CardDescription>
                        Please enter your email address and we will send you a list of your order hitory and download links.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <Label>Email</Label>
                        <Input type="email" required name="email" id="email"/>
                        {data.error && <div className="text-red-500">{data.error}</div>}
                    </div>
                </CardContent>
                <CardFooter>
                    {data.message? <p>{data.message}</p> : <SubmitButton />}    
                </CardFooter>
            </Card>

        </form>

    )

}

function SubmitButton() {
    
    const {pending} = useFormStatus()
    return ( 
        <Button type="submit" size="lg" disabled={pending} className="w-full">{pending ? "Sending..." : "Send"}</Button>
    ) 
}   