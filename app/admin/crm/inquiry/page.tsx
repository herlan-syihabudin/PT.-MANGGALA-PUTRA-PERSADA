import InquiryTable from "@/components/dashboard/InquiryTable"

export default function CRMInquiryPage() {
  return (
    <section className="p-6 md:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">
          CRM Inquiry
        </h1>
        <p className="text-gray-600 mt-1">
          List of incoming project inquiries
        </p>
      </div>

      <InquiryTable />
    </section>
  )
}
