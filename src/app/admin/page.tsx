import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import db from "@/db/db";
import { formatNumber, formatCurrency } from "@/lib/formatters";


async function getSalesData () {
const data = await db.order.aggregate({
    _sum: { pricePaidInCents: true },
    _count: true
})
    return {
        amount: (data._sum.pricePaidInCents || 0) / 100,
        numberOfSales: data._count
    
    }
}


async function getCustomerData () {
    const [userCount, orderData] = await Promise.all([
        db.user.count(),
        db.order.aggregate({
            _sum: { pricePaidInCents: true }
        })
    ])
   
    return {
      userCount,
      averageOrderValue: userCount === 0 ? 0 : (orderData._sum.pricePaidInCents || 0) / userCount / 100
    }
}

async function getProductData () {
    const [activeCount, inactiveCount] = await Promise.all([
        db.product.count({where: {isAvailableForPurchase: true}}),
        db.product.count({where: {isAvailableForPurchase: false}}),
    ])
   
    return {
      activeCount,
      inactiveCount
    }
}

export default async function AdminDashboard () {

    const [salesData, customerData, productData] = await Promise.all([
        getSalesData(),
        getCustomerData(),
        getProductData()
    ])
  
   return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
            title="Sales"
            description={`${formatNumber(salesData.numberOfSales)} Orders`}
            body={formatCurrency(salesData.amount)}
            />
        
        <DashboardCard
            title="Customers"
            description={`${formatCurrency(customerData.averageOrderValue)} Average Value`}
            body={formatNumber(customerData.userCount)}
            />
        
        <DashboardCard
            title="Active Products"
            description={`${formatNumber(productData.inactiveCount)} Inactive Products`}
            body={formatNumber(productData.activeCount)}
            />
    </div>
}

type DashboardCardProps = {
    title: string;  
    description: string;
    body: string;  
}

function DashboardCard({ title, description, body } : DashboardCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>{body}</CardContent>
        </Card>
    )
}