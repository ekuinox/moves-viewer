import { LatLng } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import * as React from 'react'
import * as L from 'react-leaflet'
import './Map.css'

interface IStoryline {
  date: string;
  summary: ISummary[];
  segments: ISegment[];
  lastUpdate: string;
}

interface ISegment {
  type: string;
  startTime: string;
  endTime: string;
  place?: IPlace;
  activities?: IActivity[];
  lastUpdate: string;
}

interface IActivity {
  activity: string;
  group: string;
  manual: boolean;
  startTime: string;
  endTime: string;
  duration: number;
  distance: number;
  steps?: number;
  trackPoints: ITrackPoint[];
}

interface ITrackPoint {
  lat: number;
  lon: number;
  time: string;
}

interface IPlace {
  id: number;
  type: string;
  location: ILocation;
}

interface ILocation {
  lat: number;
  lon: number;
}

interface ISummary {
  activity: string;
  group: string;
  duration: number;
  distance: number;
  steps?: number;
}

interface IMove {
	latlng: LatLng[]
	color: string
	opacity: number
	type: string
}

interface IMoves {
	cycling: IMove[]
	running: IMove[]
	transport: IMove[]
	walking: IMove[]
}

interface IState {
	path: string
}

export default class Map extends React.Component<{}, IState> {
	private moves: IMoves = {
		cycling: [],
		running: [],
		transport: [],
		walking: [],
	}

	constructor() {
		super({})

		this.load = this.load.bind(this)
		this.fileOnChange = this.fileOnChange.bind(this)
		this.state = {
			path: ""
		}
	}

	public render() {
		return (
			<div>
				<label style={{color: "white", backgroundColor: "#009688", borderRadius: "5rem"}} >
					storyline.jsonを貼っつけてくれ
					<input type="file" style={{display: "none"}} onChange={this.fileOnChange} />
      			</label>
				<p>{this.state.path ? "選択中 => " + this.state.path : "未選択"}</p>
				<L.Map center={[35, 139]} zoom={13}>
					<L.LayersControl>
						<L.LayersControl.BaseLayer checked={true} name="Moves Activities">
            				<L.TileLayer url='https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png' />
						</L.LayersControl.BaseLayer>

						<L.LayersControl.Overlay name={'cycling'} checked={true}>
							<L.LayerGroup>
								{this.moves.cycling.map((cycling) => {
									return <L.Polyline key={cycling.type} positions={cycling.latlng} color={cycling.color} opacity={cycling.opacity} />
								})}
							</L.LayerGroup>
						</L.LayersControl.Overlay>

						<L.LayersControl.Overlay name={'walking'} checked={true}>
							<L.LayerGroup>
								{this.moves.walking.map((walking) => {
									return <L.Polyline key={walking.type} positions={walking.latlng} color={walking.color} opacity={walking.opacity} />
								})}
							</L.LayerGroup>
						</L.LayersControl.Overlay>

						<L.LayersControl.Overlay name={'running'} checked={true}>
							<L.LayerGroup>
								{this.moves.running.map((running) => {
									return <L.Polyline key={running.type} positions={running.latlng} color={running.color} opacity={running.opacity} />
								})}
							</L.LayerGroup>
						</L.LayersControl.Overlay>

						<L.LayersControl.Overlay name={'transport'} checked={true}>
							<L.LayerGroup>
								{this.moves.transport.map((transport) => {
									return <L.Polyline key={transport.type} positions={transport.latlng} color={transport.color} opacity={transport.opacity} />
								})}
							</L.LayerGroup>
						</L.LayersControl.Overlay>

					</L.LayersControl>
        		</L.Map>
			</div>
		)
	}

	private load(json: string, jsonPath: string) {
		const storyline: IStoryline[] = JSON.parse(json);

		if (!storyline) {
			return;
		}

		this.moves = {
			cycling: [],
			running: [],
			transport: [],
			walking: [],
		}

		const colors = {
			cycling: 'blue',
			running: 'pink',
			transport: 'orange',
			walking: 'green'
		}
		
		for (const day of storyline) {
			for (const segment of day.segments) {
				if (segment.type === 'move' && segment.activities) {
					for (const activity of segment.activities) {
						const move: IMove = {latlng: [], color: colors[activity.activity], opacity: 0.3, type: activity.activity}
						for (const trackPoint of activity.trackPoints) {
							move.latlng.push(new LatLng(trackPoint.lat, trackPoint.lon))
						}
						if (!this.moves[activity.activity])
						{
							this.moves[activity.activity] = []
						}
						this.moves[activity.activity].push(move)
					}
				}
			}
		}
		this.setState({path: jsonPath})
	}

	private fileOnChange(e: any) {
		const file = e.target.files[0]

		if (file) {
			const reader = new FileReader()
			reader.readAsText(file)
			reader.onload = () => {
				this.load(reader.result as string, file.name)
			}
		}
	}
}
