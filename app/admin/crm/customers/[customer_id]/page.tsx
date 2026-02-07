export const dynamic = "force-dynamic"

type Customer = {
  customer_id: string
  company_name: string
  pic_name: string
  phone: string
  email: string
  address: string
  npwp: string
  created_at: string
}

async function getCustomer(id: string): Promise<Customer | null> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/customers/${id}`,
    { cache: "no-store" }
  )

  if (!res.ok) return null
  return res.json()
}

export default async function CustomerDetailPage({
  params,
}: {
  params: { customer_id: string }
}) {
  const customer = await getCustomer(params.customer_id)

  if (!customer) {
    return <div className="p-6">Customer tidak ditemukan</div>
  }

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">{customer.company_name}</h1>
        <p className="text-gray-500">{customer.customer_id}</p>
      </div>

      {/* INFO GRID */}
      <div className="grid md:grid-cols-3 gap-4">
        <Info label="PIC" value={customer.pic_name} />
        <Info label="Phone" value={customer.phone} />
        <Info label="Email" value={customer.email} />
        <Info label="NPWP" value={customer.npwp || "-"} />
        <Info label="Created At" value={customer.created_at} />
      </div>

      {/* ADDRESS */}
      <div className="border rounded p-4">
        <p className="text-xs text-gray-500 mb-1">Alamat</p>
        <p>{customer.address}</p>
      </div>

      {/* QUICK ACTION */}
      <div className="flex gap-3">
        <a
          href={`/admin/projects?customer_id=${customer.customer_id}`}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Lihat Project
        </a>
        <a
          href={`/admin/crm/customers/${customer.customer_id}/edit`}
          className="px-4 py-2 bg-gray-800 text-white rounded"
        >
          Edit Customer
        </a>
      </div>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="border rounded p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  )
}
