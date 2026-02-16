"use client"

import { useState, useMemo } from "react"
import AddItemForm from "./AddItemForm"

type RabItem = {
  item_id: string
  rab_id: string
  scope: string
  item_name: string
  category: string
  qty: number
  unit: string
  material_price: number
  labour_price: number
  unit_price: number
  total_price: number
  status: string
}

export default function RABDetailClient({
  initialItems,
  rab_id,
  project_id,
}: {
  initialItems: RabItem[]
  rab_id: string
  project_id: string
}) {
  const [items, setItems] = useState<RabItem[]>(initialItems)
  const [openScope, setOpenScope] = useState<string | null>(null)

  /* ================= AUTO SUM ================= */

  const totalValue = useMemo(() => {
    return items.reduce(
      (sum, i) => sum + Number(i.total_price || 0),
      0
    )
  }, [items])

  /* ================= GROUP BY SCOPE ================= */

  const grouped = useMemo(() => {
    const map: Record<string, RabItem[]> = {}

    items.forEach((item) => {
      if (!map[item.scope]) {
        map[item.scope] = []
      }
      map[item.scope].push(item)
    })

    return map
  }, [items])

  /* ================= REFRESH ================= */

  async function refreshItems() {
    const res = await fetch(`/api/estimator/rab?rab_id=${rab_id}`)
    const data = await res.json()
    setItems(data.items)
  }

  /* ================= INLINE UPDATE ================= */

  let debounceTimer: any

  function updateField(
    item_id: string,
    field: string,
    value: any
  ) {
    clearTimeout(debounceTimer)

    debounceTimer = setTimeout(async () => {
      await fetch("/api/estimator/rab/item/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item_id, field, value }),
      })

      refreshItems()
    }, 500)
  }

  /* ================= COPY ITEM ================= */

  async function copyItem(item: RabItem) {
    await fetch("/api/estimator/rab/item/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rab_id,
        project_id,
        scope: item.scope,
        item_name: item.item_name + " (Copy)",
        category: item.category,
        qty: item.qty,
        unit: item.unit,
        material_price: item.material_price,
        labour_price: item.labour_price,
        created_by: "Estimator",
      }),
    })

    refreshItems()
  }

  return (
    <div className="space-y-6">

      {/* SUMMARY PANEL */}
      <div className="bg-white border rounded-lg p-4 flex justify-between items-center">
        <div className="text-sm">
          Total Item: <b>{items.length}</b>
        </div>
        <div className="text-sm">
          Total Nilai RAB:{" "}
          <b className="text-green-600 text-lg">
            Rp {new Intl.NumberFormat("id-ID").format(totalValue)}
          </b>
        </div>
      </div>

      {/* SCOPE ACCORDION */}
      {Object.keys(grouped).map((scope, sIndex) => {

        const scopeTotal = grouped[scope].reduce(
          (sum, i) => sum + Number(i.total_price || 0),
          0
        )

        return (
          <div key={scope} className="border rounded-lg bg-white">

            {/* ACCORDION HEADER */}
            <div
              onClick={() =>
                setOpenScope(openScope === scope ? null : scope)
              }
              className="p-3 bg-gray-50 cursor-pointer flex justify-between"
            >
              <span className="font-semibold">
                {scope}
              </span>
              <span className="text-sm text-green-600">
                Rp {new Intl.NumberFormat("id-ID").format(scopeTotal)}
              </span>
            </div>

            {/* ITEMS */}
            {openScope === scope && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-2">No</th>
                      <th className="p-2">Item</th>
                      <th className="p-2">Qty</th>
                      <th className="p-2">Unit</th>
                      <th className="p-2">Harga</th>
                      <th className="p-2">Total</th>
                      <th className="p-2">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grouped[scope].map((item, index) => (
                      <tr key={item.item_id} className="border-t">

                        {/* AUTO NUMBER */}
                        <td className="p-2 text-center">
                          {(index + 1)
                            .toString()
                            .padStart(3, "0")}
                        </td>

                        {/* ITEM NAME */}
                        <td className="p-2">
                          <input
                            className="border px-2 py-1 w-full"
                            defaultValue={item.item_name}
                            onChange={(e) =>
                              updateField(
                                item.item_id,
                                "item_name",
                                e.target.value
                              )
                            }
                          />
                        </td>

                        {/* QTY */}
                        <td className="p-2">
                          <input
                            type="number"
                            className="border px-2 py-1 w-20"
                            defaultValue={item.qty}
                            onChange={(e) =>
                              updateField(
                                item.item_id,
                                "qty",
                                e.target.value
                              )
                            }
                          />
                        </td>

                        {/* UNIT */}
                        <td className="p-2">
                          <input
                            className="border px-2 py-1 w-20"
                            defaultValue={item.unit}
                            onChange={(e) =>
                              updateField(
                                item.item_id,
                                "unit",
                                e.target.value
                              )
                            }
                          />
                        </td>

                        {/* HARGA */}
                        <td className="p-2">
                          Rp{" "}
                          {new Intl.NumberFormat("id-ID").format(
                            item.unit_price
                          )}
                        </td>

                        {/* TOTAL */}
                        <td className="p-2 font-semibold text-green-600">
                          Rp{" "}
                          {new Intl.NumberFormat("id-ID").format(
                            item.total_price
                          )}
                        </td>

                        {/* COPY */}
                        <td className="p-2">
                          <button
                            onClick={() => copyItem(item)}
                            className="text-blue-600 text-xs"
                          >
                            Copy
                          </button>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )
      })}

      {/* ADD FORM */}
      <AddItemForm
        rab_id={rab_id}
        project_id={project_id}
        onSuccess={refreshItems}
      />
    </div>
  )
}
