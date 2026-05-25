import { imageSet } from "../data/assets.js"

export default function OrpheusLine({ text }) {
  return (
    <div className="orpheus-line">
      <img src={imageSet.orpheusFace} alt="ORPHEUS" />
      <div>
        <strong>ORPHEUS</strong>
        <p>「{text}」</p>
      </div>
    </div>
  )
}
