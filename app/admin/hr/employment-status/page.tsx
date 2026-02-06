"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export const dynamic = "force-dynamic";

type Employee = {
  employee_id: string;
  nama_lengkap: string;
  divisi?: string;
  jabatan?: string;
};

export default function EmployeeStatusPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/hr/employees", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        setEmployees(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <section className="p-6 md:p-10 space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Employment Status
        </h1>
        <p className="text-sm text-gray-500">
          Kelola status kerja karyawan (aktif, mutasi, resign, dll)
        </p>
      </div>

      {/* TABLE */}
      {loading ? (
        <p className="text-gray-500">Loading data karyawan...</p>
      ) : (
        <div className="overflow-x-auto bg-white border rounded-xl">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="p-3">Employee ID</th>
                <th className="p-3">Nama</th>
                <th className="p-3">Divisi</th>
                <th className="p-3">Jabatan</th>
                <th className="p-3">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {employees.map((emp) => (
                <tr
                  key={emp.employee_id}
                  className="border-t hover:bg-gray-50"
                >
                  <td className="p-3 font-mono">
                    {emp.employee_id}
                  </td>
                  <td className="p-3">{emp.nama_lengkap}</td>
                  <td className="p-3">{emp.divisi || "-"}</td>
                  <td className="p-3">{emp.jabatan || "-"}</td>
                  <td className="p-3">
                    <Link
          href={`/admin/hr/employment-status/${emp.employee_id}`}
          className="text-blue-600 hover:underline font-medium"
        >
          Lihat Status →
        </Link>
                  </td>
                </tr>
              ))}

              {employees.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="p-6 text-center text-gray-400"
                  >
                    Belum ada data karyawan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
