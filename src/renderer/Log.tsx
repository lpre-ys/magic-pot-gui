import React, { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHourglass,
  faCheck,
  faTriangleExclamation,
  faThumbsUp,
  faTrash,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import { Batch } from "../types";

type Props = {
  batchs: Batch[];
  setBatchs: React.Dispatch<React.SetStateAction<Batch[]>>;
};

export default function Log({ batchs, setBatchs }: Props) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [showErrorId, setShowErrorId] = useState<string | null>(null);

  const handleClear = () => {
    setBatchs([]);
  };

  const handleMouseEnter = (
    e: React.MouseEvent<HTMLAnchorElement>,
    id: string
  ) => {
    setPos({ x: e.clientX, y: e.clientY });
    setShowErrorId(id);
  };

  const handleMouseLeave = () => {
    setShowErrorId(null);
  };

  const isClearDisabled = useMemo<boolean>(() => {
    return (
      !batchs.length ||
      batchs.some((batch) => {
        return batch.error + batch.success < batch.files.length;
      })
    );
  }, [batchs]);
  const timeFormatter = new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const showError = batchs.find((batch) => batch.id === showErrorId);

  return (
    <div className="log">
      <div className="log-header">
        <h2>Log</h2>
        <button disabled={isClearDisabled} onClick={handleClear}>
          <FontAwesomeIcon icon={faTrash} />
        </button>
      </div>
      <table>
        <thead>
          <tr>
            <th className="status">&nbsp;</th>
            <th className="time">
              <FontAwesomeIcon icon={faClock} />
            </th>
            <th className="files">files</th>
            <th className="status">
              <FontAwesomeIcon icon={faThumbsUp} />
            </th>
            <th className="status">
              <FontAwesomeIcon icon={faTriangleExclamation} />
            </th>
          </tr>
        </thead>
        <tbody>
          {batchs.map(({ files, success, error, time, id }: Batch, i) => {
            return (
              <tr key={i}>
                <td className="status">
                  {(() => {
                    if (success + error === 0) return null;
                    if (success + error < files.length) {
                      return <FontAwesomeIcon icon={faHourglass} />;
                    }
                    return <FontAwesomeIcon icon={faCheck} />;
                  })()}
                </td>
                <td className="time">{timeFormatter.format(time)}</td>
                <td className="files">
                  <p>
                    ({files.length}) &nbsp;
                    {files.map((path) => path.split(/[/\\]/).pop()).join(", ")}
                  </p>
                </td>
                <td className="status">{success ? success : "-"}</td>
                <td className="status">
                  {error ? (
                    <a
                      onMouseEnter={(e) => {
                        handleMouseEnter(e, id);
                      }}
                      onMouseLeave={handleMouseLeave}
                    >
                      error
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {showError && (
        <div
          className="errorFiles"
          style={{
            left: pos?.x - 10,
            top: pos?.y - 10,
          }}
        >
          {showError.errorFiles?.map((path) => {
            return <p key={path}>{path.split(/[/\\]/).pop()}</p>;
          })}
        </div>
      )}
    </div>
  );
}
