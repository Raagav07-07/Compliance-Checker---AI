'use client'

import {useState,useEffect} from 'react'
type Policy= {
  _id: string;
  name: string;
  category: string;
  status: string;
  indexed: boolean;
  createdAt: string;
};
export default function renderPolicies(){
const [loading,setLoading]=useState(true)
const [policies,setPolicies]=useState<Policy[]>([])
useEffect(()=>{
    async function fetchPolicy()
    {const res=await fetch("api/policy")
    const data=await res.json()
    setPolicies(data)
    setLoading(false)}
    fetchPolicy()
},[]);
async function deactivatePolicy(id:string){
    const res=await fetch(`/api/policy/${id}/deactivate`,{
        method:'PATCH'
    });
    const data=await res.json();
    console.log(data);
    // Refresh policies after deactivation
    setLoading(true);
    const resUpdated=await fetch("api/policy")
    const dataUpdated=await resUpdated.json()
    setPolicies(dataUpdated)
    setLoading(false);
}
     if (loading) return <p className="p-6">Loading policies...</p>;
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-6">Policies</h1>

      <table className="w-full border border-slate-300 text-sm">
        <thead className="bg-slate-100">
          <tr>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Category</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Indexed</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {policies.map((p) => (
            <tr key={p._id}>
              <td className="p-2 border">{p.name}</td>
              <td className="p-2 border">{p.category}</td>
              <td className="p-2 border">{p.status}</td>
              <td className="p-2 border">
                {p.indexed ? "✅" : "❌"}
              </td>
              <td className="p-2 border">
                {p.status === "ACTIVE" && (
                  <button
                    onClick={() => deactivatePolicy(p._id)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Deactivate
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}