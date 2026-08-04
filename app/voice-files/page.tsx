"use client";

import { useState } from "react";
import { voiceFiles } from "@/lib/mock-data";
import { PageHead, EmptyRow, Toast } from "@/components/ui";

const RESTRICTED = [
  "Political content without ECI/broadcast clearance",
  "Financial or investment solicitation promising guaranteed returns",
  "Adult, obscene or defamatory material",
  "Impersonation of banks, government or telecom operators",
  "Unsolicited promotional audio to DnD-registered numbers",
];

export default function VoiceFiles() {
  const [toast, setToast] = useState<string | null>(null);
  return (
    <>
      <PageHead kicker="Voice Library" title="Voice Files" />

      <div className="banner warn">
        <i className="ph-duotone ph-shield-warning" style={{ fontSize: 18, flex: "none", marginTop: 1 }} />
        <div>
          <b>Restricted Voice Content</b> — the following are rejected on review: {RESTRICTED.map((r, i) => (
            <span key={i}>{i > 0 ? "; " : " "}{r}</span>
          ))}.
        </div>
      </div>

      <div className="card">
        <div className="card-head"><div><h3>Voice Files</h3><div className="sub">{voiceFiles.length} files</div></div></div>
        <div className="table-wrap">
          <table className="table">
            <thead><tr>
              <th>Voice File Id</th><th>File Name</th><th>File Type</th><th>Status</th><th>Uploaded By</th><th>Account</th><th>Remarks</th><th>Action</th>
            </tr></thead>
            <tbody>
              {voiceFiles.length === 0 ? <EmptyRow colSpan={8} icon="ph-file-audio" message="No voice files uploaded." /> :
                voiceFiles.map((f) => (
                  <tr key={f.id}>
                    <td className="tabnum">{f.id}</td>
                    <td style={{ fontWeight: 600 }}>{f.fileName}</td>
                    <td className="text-muted">{f.fileType}</td>
                    <td><span className={`pill ${f.status === "Approved" ? "pill-success" : "pill-accent"}`}><span className="dot" />{f.status}</span></td>
                    <td>{f.uploadedBy}</td>
                    <td className="text-muted">{f.account}</td>
                    <td className="text-muted">{f.remarks}</td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => setToast(`Playing ${f.fileName}`)}><i className="ph-duotone ph-play" style={{ fontSize: 14 }} /> Listen</button>
                        <button className="btn btn-secondary btn-sm" onClick={() => setToast(`Downloading ${f.fileName}`)}><i className="ph-duotone ph-download-simple" style={{ fontSize: 14 }} /> Download</button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
      <Toast message={toast} onDone={() => setToast(null)} />
    </>
  );
}
