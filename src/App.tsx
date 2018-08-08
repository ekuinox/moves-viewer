import * as React from 'react'
import './App.css'
import Map from './Map'

class App extends React.Component {
	public render() {
		return (
			<div style={{top: "1rem", position: "relative", textAlign: "center"}}>
				<Map />
			</div>
		)
	}
}

export default App;
