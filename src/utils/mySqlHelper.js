export const responseFormatter = (cols, dataRows) => {
	return dataRows.map((registry) =>
		registry.reduce((result, field, i) => {
			const columnHeader = cols[i]

			return { ...result, [columnHeader]: field }
		}, {})
	)
}
