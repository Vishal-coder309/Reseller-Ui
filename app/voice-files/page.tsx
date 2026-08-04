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

      <div className="card">
        <div className="card-head"><div>
          <h3 style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>Voice Files
            <span className="info-tip" tabIndex={0} aria-label="Restricted voice content policy">
              <i className="ph-duotone ph-info" style={{ fontSize: 17, color: "var(--color-accent-2-700)", cursor: "help" }} />
              <span className="info-tip-pop">
                <span className="info-tip-head">
                  <span style={{ width: 32, height: 32, flex: "none", borderRadius: "50%", background: "var(--color-accent-2-100)", color: "var(--color-accent-2-700)", display: "grid", placeItems: "center", boxShadow: "inset 0 0 0 1px var(--color-accent-2-200)" }}>
                    <i className="ph-duotone ph-shield-warning" style={{ fontSize: 17 }} />
                  </span>
                  <span style={{ lineHeight: 1.3 }}>
                    <b style={{ fontSize: 13, color: "var(--color-accent-2-800)" }}>Restricted Voice Content</b>
                    <span style={{ display: "block", fontSize: 11.5, color: "var(--color-accent-2-700)", marginTop: 1 }}>Rejected on admin review</span>
                  </span>
                </span>
                <span style={{ display: "block", padding: "12px 15px 14px" }}>
                  {RESTRICTED.map((r) => (
                    <span className="info-tip-row" key={r}>
                      <i className="ph-duotone ph-prohibit" style={{ fontSize: 14, color: "var(--color-accent-2)", flex: "none", marginTop: 2 }} />
                      <span style={{ color: "var(--color-neutral-700)" }}>{r}</span>
                    </span>
                  ))}
                </span>
              </span>
            </span>
          </h3>
          <div className="sub">{voiceFiles.length} files</div>
        </div></div>
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
                    <td><span className={`pill ${f.status === "Approved" ? "pill-success" : "pill-warn"}`}><span className="dot" />{f.status}</span></td>
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
