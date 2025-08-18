import React from "react";

type PropertyHistoryEvent = {
  date: string;
  event: string;
  source: string;
  price: number;
};

type PropertyHistoryProps = {
  history: PropertyHistoryEvent[];
};

function formatPrice(price: number): string {
  return `$${price.toLocaleString()}`;
}


export default function PropertyHistory({ history }: PropertyHistoryProps) {
  return (
    <section id="property-history" className="mb-12">
      <h2 className="text-2xl font-bold mb-6">Property History</h2>
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {history.map((event, index) => (
              <tr key={index}>
                <td className="px-6 py-4 text-sm text-gray-900">{event.date}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{event.event}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{event.source}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {formatPrice(event.price)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
