"use client";

import { userOrderExists } from "@/app/actions/orders";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";
import { Elements, LinkAuthenticationElement, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import Image from "next/image";
import { FormEvent, useState } from "react";


type CheckoutFormProps = {
    product: {
        imagePath: string,
        name: string,
        PriceInCents: number,
        description: string,
        id: string

    }
    clientSecret: string
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY as string)

export function CheckoutForm ({product, clientSecret} : CheckoutFormProps) {
    return (
        <>
            <div className="max-w-5xl w-full mx-auto space-y-8">
                <div className="flex gap-4 items-center">
                   <div className="aspect-video flex-shrink-0 w-1/3 relative">
                        <Image className="object-cover" src={product.imagePath} fill alt={product.name}/>
                   </div>
                   <div>
                        <div className="text-lg">
                            {formatCurrency(product.PriceInCents / 100)}
                        </div>
                            <h1 className="text-2xl font-bold">{product.name}</h1>
                            <div className="line-clamp-3 text-muted-foreground">{product.description}</div>
                    </div>
                </div>
                <Elements options={{ clientSecret}} stripe={stripePromise}>
                    <StripeForm PriceinCents={product.PriceInCents} productId={product.id}/>
                </Elements>
            </div>
       </>
    )
}

function StripeForm ({PriceinCents, productId} : {PriceinCents: number, productId: string}) {

    const stripe = useStripe();
    const elements = useElements();
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>();
    const [email, setEmail] = useState<string>();

    async function handleSubmit (e: FormEvent) {
        e.preventDefault();
        if (stripe == null || elements == null || email == null) {
            return;
        }

        setIsLoading(true);

        // First we check if the order exists

        const orderExists= await userOrderExists(email, productId)

        if(orderExists) {
            setErrorMessage("You've already purchased this product, download it from my Orders page");
            setIsLoading(false);
            return;
        }

        // Then we confirm the paymentIntent if the customer hasn't already paid for that order

        stripe.confirmPayment( {elements, confirmParams : {
            return_url : `${process.env.NEXT_PUBLIC_SERVER_URL}/stripe/purchase-success`
        }
        }).then(({ error }) => {
            if (error.type = "card_error" || error.type === "validation_error") {
                setErrorMessage(error.message);
            }
            else {
                setErrorMessage("An unexpected error occurred");
            }
        }).finally(() => {
            setIsLoading(false);
        })
    }

    return (
        <form onSubmit={handleSubmit}>
        <Card>
            <CardHeader>
                <CardTitle>Checkout</CardTitle>
                {errorMessage &&<CardDescription className="text-destructive">{errorMessage}</CardDescription>}
            </CardHeader>
            <CardContent>
                <PaymentElement/>
                <div className="mt-4">
                    <LinkAuthenticationElement onChange={e => setEmail(e.value.email)}/>
                </div>
            </CardContent>
            <CardFooter>
                <Button className="w-full" size="lg" disabled={stripe == null || elements == null || isLoading}>
                   {isLoading? "Purchasing..." : `Purchase - ${formatCurrency(PriceinCents / 100)}`} 
                </Button>
            </CardFooter>
        </Card>
        
        </form>

    )
}