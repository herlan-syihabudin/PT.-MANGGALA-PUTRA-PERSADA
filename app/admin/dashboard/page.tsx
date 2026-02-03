"use client"

import Link from "next/link"

export default function AdminDashboard() {
  return (
    <section className="p-6 md:p-10 bg-gray-50 min-h-screen">

      {/* PAGE TITLE */}
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-gray-900">
          CRM Dashboard
        </h1>
        <p className="text-gray-600 mt-2">
          Overview of inquiries, pipeline status, and active follow-ups.
        </p>
      </div>

      {/* KPI CARDS */}
      <div className="grid md:grid-cols-4 gap-6 mb-12">
        <KPI title="New Inquiries" value="12" note="This month" />
        <KPI title="On Progress" value="8" note="Follow Up / Survey" />
        <KPI title="Deals Closed" value="3" note="This month" />
        <KPI title="Pipeline Value" value="Rp 4.8 B" note="Estimated" />
      </div>

      {/* MAIN GRID */}
      <div className="grid md:grid-cols-3 gap-8">

        {/* PIPELINE STATUS */}
        <div className="bg-white border rounded-2xl p-6 md:col-span-2">
          <h3 className="font-bold text-gray-900 mb-4">
            Inquiry Pipeline Status
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <StatusItem label="New" value={4} />
            <StatusItem label="Follow Up" value={6} />
            <StatusItem label="Survey" value={3} />
            <StatusItem label="Penawaran" value={2} />
            <StatusItem label="Deal" value={1} />
            <StatusItem label="Lost" value={1} />
          </div>

          <div className="mt-6">
            <Link
              href="/admin/crm/inquiry"
              className="text-sm font-semibold text-red-600 hover:underline"
            >
              View All Inquiries →
            </Link>
          </div>
        </div>

        {/* FOLLOW UP REMINDER */}
        <div className="bg-white border rounded-2xl p-6">
          <h3 className="font-bold text-gray-900 mb-4">
            Follow-Up Reminder
          </h3>

          <ul className="space-y-4 text-sm">
            <ReminderItem
              name="PT Sinar Jaya"
              status="Follow Up"
              date="05 Feb 2026"
            />
            <ReminderItem
              name="Budi Santoso"
              status="Survey"
              date="06 Feb 2026"
            />
            <ReminderItem
              name="PT Maju Bersama"
              status="Penawaran"
              date="07 Feb 2026"
            />
          </ul>

          <div className="mt-6">
            <Link
              href="/admin/crm/inquiry"
              className="text-sm font-semibold text-red-600 hover:underline"
            >
              Open CRM →
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ===============================
   COMPONENTS
================================ */

function KPI({
  title,
  value,
  note,
}: {
  title: string
  value: string
  note: string
}) {
  return (
    <div className="bg-white border rounded-2xl p-6">
      <p className="text-sm text-gray-500 mb-2">{title}</p>
      <p className="text-3xl font-extrabold text-gray-900">{value}</p>
      <p className="text-xs text-gray-400 mt-1">{note}</p>
    </div>
  )
}

function StatusItem({
  label,
  value,
}: {
  label: string
  value: number
}) {
  return (
    <div className="border rounded-xl p-4 flex items-center justify-between">
      <span className="text-gray-700">{label}</span>
      <span className="font-bold text-gray-900">{value}</span>
    </div>
  )
}

function ReminderItem({
  name,
  status,
  date,
}: {
  name: string
  status: string
  date: string
}) {
  return (
    <li className="flex items-start justify-between border-b pb-3 last:border-b-0">
      <div>
        <p className="font-semibold text-gray-900">{name}</p>
        <p className="text-xs text-gray-500">{status}</p>
      </div>
      <span className="text-xs text-gray-400">{date}</span>
    </li>
  )
}
