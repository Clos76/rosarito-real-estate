import { formatPrice } from "@/lib/utils"
import { Property } from "@/app/property/[id]/PropertyInterface"
import React, { useState, useEffect } from 'react';
import path from "path";


//type definitions that be used in pie
interface ChartDataItem {
    label:string;
    value: number;
    color:string;
}

// what the component expects
interface PieChartProps {
    data: ChartDataItem[];
}

interface MortgageCalculatorProps {
    price?: number;
}

//simple pie chart component
const PieChart: React.FC<PieChartProps> = ({data}) => {
    //sum of all pie slice values
    const total = data.reduce((sum: number, item) => sum+item.value, 0);
    let currentAngle = -90 //start from top

    //calculate percentage of total and corresponding angles in degrees
   const slices = data.map((item, index)=> {
    const percentage = (item.value / total) * 100;
    const angle = (item.value / total) * 360;

    const slice = {
        ...item, 
        percentage, 
        //calculate where last angle starts and ends
        startAngle: currentAngle,
        endAngle: currentAngle + angle,
    };

    currentAngle += angle;
    return slice;
   });

   // creates svg path string for slice. 1. move to the center of circle. 2. draw line to start edge of slice. 3. draw arc to ending edge. 4. close back to center
   const createPath = (centerX: number, centerY: number, radius: number, startAngle: number, endAngle: number): string => {
    const start = polarToCartesian(centerX, centerY, radius, endAngle);
    const end = polarToCartesian(centerX, centerY, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    return [
        "M", centerX, centerY, //move to center
        "L", start.x, start.y, // draw line to slice staret
        "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y, //arc to slice end
        "Z" // close path back to center
    ].join(" ");
   };

   //converts polar coordinates (angle, radius) into cartesian coordinates(x,y)
   const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
        x:centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
    };
   };

    return (
    <div className="flex flex-col items-center">
      <svg width="200" height="200" className="mb-4">
        {slices.map((slice, index) => (
          <path
            key={index}
            d={createPath(100, 100, 80, slice.startAngle, slice.endAngle)}
            fill={slice.color}
            stroke="white"
            strokeWidth="2"
          />
        ))}
      </svg>
      <div className="space-y-2 w-full">
        {slices.map((slice, index) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <div 
                className="w-4 h-4 rounded mr-2"
                style={{ backgroundColor: slice.color }}
              ></div>
              <span>{slice.label}</span>
            </div>
            <div className="text-right">
              <div className="font-semibold">{formatPrice(slice.value)}</div>
              <div className="text-gray-500">{slice.percentage.toFixed(1)}%</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function MortgageCalculator({ price = 500000 }: MortgageCalculatorProps) {
  const [downPayment, setDownPayment] = useState(80000);
  const [interestRate, setInterestRate] = useState(6.5);
  const [loanTerm, setLoanTerm] = useState(30);
  const [propertyTax, setPropertyTax] = useState(400);
  const [insurance, setInsurance] = useState(200);
  const [pmi, setPmi] = useState(0);
  
  // Calculated values
  const [principalAndInterest, setPrincipalAndInterest] = useState(0);
  const [totalMonthlyPayment, setTotalMonthlyPayment] = useState(0);

  const calculatePayment = () => {
    const principal = price - downPayment;
    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = loanTerm * 12;
    
    let monthlyPI = 0;
    if (monthlyRate > 0) {
      monthlyPI = (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -numberOfPayments));
    } else {
      monthlyPI = principal / numberOfPayments;
    }
    
    // Calculate PMI if down payment is less than 20%
    const downPaymentPercentage = (downPayment / price) * 100;
    const monthlyPmi = downPaymentPercentage < 20 ? (principal * 0.005) / 12 : 0;
    
    setPrincipalAndInterest(monthlyPI);
    setPmi(monthlyPmi);
    setTotalMonthlyPayment(monthlyPI + propertyTax + insurance + monthlyPmi);
  };

  useEffect(() => {
    calculatePayment();
  }, [downPayment, interestRate, loanTerm, propertyTax, insurance, price]);

  // Data for pie chart
  const chartData: ChartDataItem[] = [
    { 
      label: 'Principal & Interest', 
      value: principalAndInterest, 
      color: '#2563eb' // blue-600
    },
    { 
      label: 'Property Tax', 
      value: propertyTax, 
      color: '#dc2626' // red-600
    },
    { 
      label: 'Insurance', 
      value: insurance, 
      color: '#16a34a' // green-600
    },
    ...(pmi > 0 ? [{ 
      label: 'PMI', 
      value: pmi, 
      color: '#ea580c' // orange-600
    }] : [])
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
      <h3 className="text-xl font-semibold mb-6">Mortgage Calculator</h3>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Home Price</label>
            <input
              type="text"
              value={formatPrice(price)}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Down Payment</label>
            <input
              type="number"
              value={downPayment}
              onChange={(e) => setDownPayment(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              {((downPayment / price) * 100).toFixed(1)}% of home price
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Interest Rate (%)</label>
            <input
              type="number"
              step="0.01"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Loan Term</label>
            <select 
              value={loanTerm}
              onChange={(e) => setLoanTerm(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value={15}>15 years</option>
              <option value={20}>20 years</option>
              <option value={30}>30 years</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Property Tax</label>
            <input
              type="number"
              value={propertyTax}
              onChange={(e) => setPropertyTax(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Insurance</label>
            <input
              type="number"
              value={insurance}
              onChange={(e) => setInsurance(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Payment Summary Section */}
        <div className="flex flex-col justify-center">
          <div className="bg-blue-50 p-6 rounded-lg text-center">
            <p className="text-sm text-gray-600 mb-2">Estimated Monthly Payment</p>
            <p className="text-3xl font-bold text-blue-600 mb-4">
              {formatPrice(totalMonthlyPayment)}
            </p>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Principal & Interest: {formatPrice(principalAndInterest)}</p>
              <p>Property Tax: {formatPrice(propertyTax)}</p>
              <p>Insurance: {formatPrice(insurance)}</p>
              {pmi > 0 && <p>PMI: {formatPrice(pmi)}</p>}
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span>Loan Amount:</span>
                <span className="font-medium">{formatPrice(price - downPayment)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Interest:</span>
                <span className="font-medium">
                  {formatPrice((principalAndInterest * loanTerm * 12) - (price - downPayment))}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total Paid:</span>
                <span className="font-medium">
                  {formatPrice(totalMonthlyPayment * loanTerm * 12)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Pie Chart Section */}
        <div className="flex flex-col">
          <h4 className="text-lg font-medium mb-4 text-center">Monthly Payment Breakdown</h4>
          <PieChart data={chartData} />
        </div>
      </div>
    </div>
  );
}