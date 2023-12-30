export const responseFormatter = (cols, dataRows) => {
	return dataRows.map((row) =>
		row.reduce((acc, val, i) => {
			return { ...acc, [cols[i]]: val }
		}, {})
	)
}
