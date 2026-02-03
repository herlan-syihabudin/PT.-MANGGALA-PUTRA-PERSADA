"use client"

type Inquiry = {
  timestamp: string
  inquiry_id: string
  source: string
  client_name: string
  company_name: string
  whatsapp: string
  project_type: string
  project_location: string
  estimated_budget: string
  urgency: string
  status: string
  pic: string
  next_follow_up: string
}

const dummyData: Inquiry[] = [
  {
    timestamp: "2024-02-05 10:12",
    inquiry_id: "INQ-0012",
    source: "Website",
    client_name: "Budi Santoso",
    company_name: "PT Maju Jaya",
    whatsapp: "0812xxxxxxx",
    project_type: "Warehouse Construction",
    project_location: "Bekasi",
    estimated_budget: "Rp 1 – 3 B",
    urgency: "High",
    status: "Follow Up",
    pic: "Admin",
    next_follow_up: "2024-02-08",
  },
  {
    timestamp: "2024-02-06 14:40",
    inquiry_id: "INQ-0013",
    source: "WhatsApp",
    client_name: "Andi Pratama",
    company_name: "CV Sentosa",
    whatsapp: "0813xxxxxxx",
    project_type: "Office Renovation",
    project_location: "Jakarta",
    estimated_budget: "< 500 Jt",
    urgency: "Medium",
    status: "New",
    pic: "Admin",
    next_follow_up: "2024-02-07",
  },
]

const statusColor: Record<string, string> = {
  New: "bg-blue-100 text-blue-700",
  "Follow Up": "bg-indigo-100 text-indigo-700",
  Survey: "bg-yellow-100 text-yellow-700",
  Penawaran: "bg-orange-100 text-orange-700",
  Deal: "bg-green-100 text-green-700",
  Lost: "bg-red-100 text-red-700",
}

const urgencyColor: Record<string, string> = {
  High: "text-red-600 font-semibold",
  Medium: "text-yellow-600 font-semibold",
  Low: "text-gray-500",
}

export default function InquiryTable() {
  return (
    <div className="bg-white border rounded-2xl p-6 mt-10">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-bold text-gray-900">
            CRM Inquiry List
          </h3>
          <p className="text-sm text-gray-500">
            All incoming project inquiries
          </p>
        </div>

        <button className="text-sm bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
          + New Inquiry
        </button>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-gray-500">
              <th className="py-3 text-left">ID</th>
              <th className="py-3 text-left">Client</th>
              <th className="py-3 text-left">Project</th>
              <th className="py-3 text-left">Location</th>
              <th className="py-3 text-left">Budget</th>
              <th className="py-3 text-left">Urgency</th>
              <th className="py-3 text-left">Status</th>
              <th className="py-3 text-left">PIC</th>
              <th className="py-3 text-left">Next Follow Up</th>
            </tr>
          </thead>

          <tbody>
            {dummyData.map((row) => (
              <tr
                key={row.inquiry_id}
                className="border-b hover:bg-gray-50 transition cursor-pointer"
              >
                <td className="py-3 font-semibold">
                  {row.inquiry_id}
                </td>

                <td className="py-3">
                  <p className="font-medium text-gray-900">
                    {row.client_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {row.company_name}
                  </p>
                </td>

                <td className="py-3">
                  <p>{row.project_type}</p>
                  <p className="text-xs text-gray-500">
                    Source: {row.source}
                  </p>
                </td>

                <td className="py-3">
                  {row.project_location}
                </td>

                <td className="py-3">
                  {row.estimated_budget}
                </td>

                <td className={`py-3 ${urgencyColor[row.urgency]}`}>
                  {row.urgency}
                </td>

                <td className="py-3">
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-semibold ${statusColor[row.status]}`}
                  >
                    {row.status}
                  </span>
                </td>

                <td className="py-3">
                  {row.pic}
                </td>

                <td className="py-3">
                  {row.next_follow_up}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  )
}
