"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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
    fetch("/api/hr/employees")
      .then((res) => res.json())
      .then((data) => {
        setEmployees(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Employment Status</h1>
        <p className="text-sm text-gray-500">
          Kelola status kerja karyawan (aktif, mutasi, resign, dll)
        </p>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="text-gray-500">Loading data karyawan...</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white">
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
                      href={`/admin/hr/employee-status/${emp.employee_id}`}
                      className="text-blue-600 hover:underline"
                    >
                      Lihat Status
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
    </div>
  );
}
