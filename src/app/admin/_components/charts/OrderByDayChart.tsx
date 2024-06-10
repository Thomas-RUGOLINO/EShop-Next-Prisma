"use client";

import { formatCurrency } from '@/lib/formatters';
import {LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const data = [

    {value: 12, date :'2024-06-08'},
    {value: 17, date :'2024-06-09'},
    {value: 25, date :'2024-06-10'},
]

export function OrderByDayChart() {
 return (
    <ResponsiveContainer width="100%" minHeight={300}>
    <LineChart
        data={data}
    >
        <CartesianGrid stroke="hsl(var(--muted))"/>
        <XAxis dataKey="date" stroke="hsl(var(--primary))" />
        <YAxis tickFormatter={tick => formatCurrency(tick)} stroke="hsl(var(--primary))"/>
        <Tooltip formatter={value => formatCurrency(value as number)}/>
        <Line dot={false} dataKey="value" type="monotone" name="Total Sales" stroke="hsl(var(--primary))"/>

    </LineChart>
    </ResponsiveContainer>
 )
}