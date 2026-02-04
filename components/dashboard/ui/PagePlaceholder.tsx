export default function PagePlaceholder({
  title,
  description,
}: {
  title: string
  description?: string
}) {
  return (
    <section className="p-6 md:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">{title}</h1>
        {description && (
          <p className="text-gray-600 mt-1">{description}</p>
        )}
      </div>

      <div className="bg-white border rounded-2xl p-6 text-sm text-gray-600">
        <p className="font-medium text-gray-800 mb-2">
          Module Status
        </p>
        <p>
          Modul ini sudah <b>terdaftar & terkunci di ERP Menu</b>.  
          Logika, workflow, dan database akan diimplementasikan bertahap.
        </p>
      </div>
    </section>
  )
}
