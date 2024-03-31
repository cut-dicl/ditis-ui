import React from 'react';
import { convertUnderlineToTitleCase } from "../../../utils/convertStringFunctions";
import { Panel } from 'primereact/panel';

export default function Statistics({ analyzeResults }) {
  return (
    <Panel header="General Statistics" className='mb-4'>
      <ul className={`columns-3`}>
        {analyzeResults &&
          analyzeResults.statistics &&
          typeof analyzeResults.statistics === "object" &&
          Object.entries(analyzeResults.statistics).map(
            ([metricName, metricData]) => (
              <>
                {Object.keys(metricData).map((key) => (
                  <li key={key}>
                    {convertUnderlineToTitleCase(key)}:{" "}
                    {metricData[key]}
                  </li>
                ))}
              </>
            )
          )}
      </ul>
    </Panel>
  )
}
