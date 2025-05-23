"use client"

import { addPerPage, addSort } from "@/features/filter/filterSlice"
import { toggleFavoriteProperty } from "@/features/property/propertySlice"
import type { RootState } from "@/features/store"
import Link from "next/link"
import type React from "react"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Autoplay, Navigation, Pagination } from "swiper/modules"
import { Swiper, SwiperSlide } from "swiper/react"

// Updated interface to match the JSON structure
interface PropertyListItem {
	id: number
	keyword: string
	images?: {
		[key: string]: string
	}
	address: string
	city: string
	state: string
	status: string
	label: string
	type: string
	bedrooms: number
	bathrooms: number
	garages: number
	rooms: number
	minPrice: number
	maxPrice: number
	minSize: number
	maxSize: number
	amenities: string[]
	agent?: {
		name: string
		image: string
	}
}

export default function PropertyList3() {
	const dispatch = useDispatch()
	const { properties, favoriteProperties } = useSelector((state: RootState) => state.property)
	const { propertyFilter } = useSelector((state: RootState) => state.filter)

	const [filteredProperties, setFilteredProperties] = useState<PropertyListItem[]>([])
	const [currentPage, setCurrentPage] = useState(1)
	const [itemsPerPage, setItemsPerPage] = useState(6) // Changed to 6 to match the UI layout
	const [sortOrder, setSortOrder] = useState("default")
	const [viewMode, setViewMode] = useState("grid") // "grid" or "list"

	useEffect(() => {
		let result = [...properties] as PropertyListItem[]

		if (propertyFilter.keyword) {
			const keyword = propertyFilter.keyword.toLowerCase()
			result = result.filter(
				(property) =>
					property.keyword.toLowerCase().includes(keyword) || property.address.toLowerCase().includes(keyword),
			)
		}

		if (propertyFilter.city) {
			result = result.filter(
				(property) => property.city.toLowerCase() === propertyFilter.city.replace(/-/g, " ").toLowerCase(),
			)
		}

		if (propertyFilter.state) {
			result = result.filter(
				(property) => property.state.toLowerCase() === propertyFilter.state.replace(/-/g, " ").toLowerCase(),
			)
		}

		if (propertyFilter.status) {
			result = result.filter(
				(property) => property.status.toLowerCase() === propertyFilter.status.replace(/-/g, " ").toLowerCase(),
			)
		}

		// if (propertyFilter.type) {
		// 	result = result.filter(
		// 		(property) => property.type.toLowerCase() === propertyFilter.type.replace(/-/g, " ").toLowerCase(),
		// 	)
		// }

		if (propertyFilter.bedrooms.min > 0) {
			result = result.filter((property) => property.bedrooms >= propertyFilter.bedrooms.min)
		}

		if (propertyFilter.bathrooms.min > 0) {
			result = result.filter((property) => property.bathrooms >= propertyFilter.bathrooms.min)
		}

		if (propertyFilter.garages.min > 0) {
			result = result.filter((property) => property.garages >= propertyFilter.garages.min)
		}

		if (propertyFilter.rooms.min > 0) {
			result = result.filter((property) => property.rooms >= propertyFilter.rooms.min)
		}

		result = result.filter(
			(property) => property.minPrice >= propertyFilter.price.min && property.maxPrice <= propertyFilter.price.max,
		)

		result = result.filter(
			(property) => property.minSize >= propertyFilter.size.min && property.maxSize <= propertyFilter.size.max,
		)

		if (propertyFilter.amenities.length > 0) {
			result = result.filter((property) =>
				propertyFilter.amenities.every((amenity) =>
					property.amenities.some((a) => a.toLowerCase() === amenity.replace(/-/g, " ").toLowerCase()),
				),
			)
		}

		if (sortOrder === "oldest") {
			result.sort((a, b) => a.id - b.id)
		} else if (sortOrder === "newest") {
			result.sort((a, b) => b.id - a.id)
		} else if (sortOrder === "price-low") {
			result.sort((a, b) => a.minPrice - b.minPrice)
		} else if (sortOrder === "price-high") {
			result.sort((a, b) => b.minPrice - a.minPrice)
		}

		setFilteredProperties(result)
		setCurrentPage(1)

		const startIndex = 0
		const endIndex = Math.min(itemsPerPage, result.length)
		dispatch(addPerPage({ start: startIndex, end: endIndex }))
	}, [properties, propertyFilter, sortOrder, itemsPerPage, dispatch])

	const indexOfLastProperty = currentPage * itemsPerPage
	const indexOfFirstProperty = indexOfLastProperty - itemsPerPage
	const currentProperties = filteredProperties.slice(indexOfFirstProperty, indexOfLastProperty)
	const totalPages = Math.ceil(filteredProperties.length / itemsPerPage)

	const handlePageChange = (pageNumber: number) => {
		setCurrentPage(pageNumber)
		const startIndex = (pageNumber - 1) * itemsPerPage
		const endIndex = Math.min(pageNumber * itemsPerPage, filteredProperties.length)
		dispatch(addPerPage({ start: startIndex, end: endIndex }))
	}

	const handleFavoriteToggle = (e: React.MouseEvent, propertyId: number) => {
		e.preventDefault()
		dispatch(toggleFavoriteProperty(propertyId))
	}

	const handleSortOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setSortOrder(e.target.value)
		setCurrentPage(1)
		dispatch(addSort(e.target.value))
	}

	const handleViewModeChange = (mode: string) => {
		setViewMode(mode)
	}

	// Initialize tab functionality
	useEffect(() => {
		// Set up tab functionality
		const gridTab = document.getElementById("pills-home-tab")
		const listTab = document.getElementById("pills-profile-tab")

		if (gridTab && listTab) {
			gridTab.addEventListener("click", () => handleViewModeChange("grid"))
			listTab.addEventListener("click", () => handleViewModeChange("list"))
		}

		return () => {
			if (gridTab && listTab) {
				gridTab.removeEventListener("click", () => handleViewModeChange("grid"))
				listTab.removeEventListener("click", () => handleViewModeChange("list"))
			}
		}
	}, []) // Removed handleViewModeChange from dependencies

	const swiperFade = {
		modules: [Autoplay, Pagination, Navigation],
		spaceBetween: 0,
		slidesPerView: 1,
		freeMode: true,
		watchSlidesProgress: true,
		autoplay: {
			delay: 2500,
		},
		pagination: {
			el: ".swiper-pagination",
			clickable: true,
		},
		navigation: {
			nextEl: ".swiper-button-next",
			prevEl: ".swiper-button-prev",
		},
	}

	// Function to render property images
	const renderPropertyImages = (property: PropertyListItem) => {
		if (property.images && Object.keys(property.images).length > 0) {
			return (
				<Swiper {...swiperFade} className="swiper swiper-fade">
					<div className="swiper-wrapper">
						{Object.values(property.images).map((image, index) => (
							<SwiperSlide key={index}>
								<img src={image || "/assets/img/all-images/properties/property-img1.png"} alt={property.keyword} />
							</SwiperSlide>
						))}
					</div>
					<div className="swiper-pagination" />
				</Swiper>
			)
		} else {
			return <img src="/assets/img/all-images/properties/property-img1.png" alt={property.keyword} />
		}
	}

	// Function to render pagination
	const renderPagination = () => {
		if (totalPages <= 1) return null

		return (
			<div className="pagination-area mt-4">
				<nav aria-label="Page navigation">
					<ul className="pagination justify-content-center">
						<li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
							<Link
								className="page-link"
								href="#"
								aria-label="Previous"
								onClick={(e) => {
									e.preventDefault()
									handlePageChange(Math.max(1, currentPage - 1))
								}}
							>
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
									<path d="M10.8284 12.0007L15.7782 16.9504L14.364 18.3646L8 12.0007L14.364 5.63672L15.7782 7.05093L10.8284 12.0007Z" />
								</svg>
							</Link>
						</li>
						{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
							<li key={page} className={`page-item ${currentPage === page ? "active" : ""}`}>
								<Link
									className="page-link"
									href="#"
									onClick={(e) => {
										e.preventDefault()
										handlePageChange(page)
									}}
								>
									{page}
								</Link>
							</li>
						))}
						<li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
							<Link
								className="page-link"
								href="#"
								aria-label="Next"
								onClick={(e) => {
									e.preventDefault()
									handlePageChange(Math.min(totalPages, currentPage + 1))
								}}
							>
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
									<path d="M13.1717 12.0007L8.22192 7.05093L9.63614 5.63672L16.0001 12.0007L9.63614 18.3646L8.22192 16.9504L13.1717 12.0007Z" />
								</svg>
							</Link>
						</li>
					</ul>
				</nav>
			</div>
		)
	}

	return (
		<>
			<div className="property-mapgrid-area">
				<div className="heading1">
					<h3>Properties ({filteredProperties.length})</h3>
					<div className="tabs-btn">
						<div className="filter-group">
							<select value={sortOrder} onChange={handleSortOrderChange}>
								<option value="default">Sort by (Default)</option>
								<option value="oldest">Oldest</option>
								<option value="newest">Newest</option>
								<option value="price-low">Price (Low to High)</option>
								<option value="price-high">Price (High to Low)</option>
							</select>
						</div>
					</div>
				</div>
				<div className="space32" />
				<div className="row">
					<div className="col-lg-12">
						{currentProperties.length > 0 ? (
							currentProperties.map((property) => (
								<div className="row" key={property.id}>
									<div className="col-lg-12">
										<div className="property-boxarea">
											<div className="row align-items-center">
												<div className="col-lg-6 col-md-6">
													<div className="img1 image-anime">
														{renderPropertyImages(property)}
														<button
															className={`favorite-btn ${favoriteProperties.includes(property.id) ? "active" : ""}`}
															onClick={(e) => handleFavoriteToggle(e, property.id)}
														>
															<svg
																xmlns="http://www.w3.org/2000/svg"
																viewBox="0 0 24 24"
																fill="currentColor"
																width="24"
																height="24"
															>
																<path d="M12.001 4.52853C14.35 2.42 17.98 2.49 20.2426 4.75736C22.5053 7.02472 22.583 10.637 20.4786 12.993L11.9999 21.485L3.52138 12.993C1.41705 10.637 1.49571 7.01901 3.75736 4.75736C6.02157 2.49315 9.64519 2.41687 12.001 4.52853Z" />
															</svg>
														</button>
													</div>
												</div>
												<div className="col-lg-6 col-md-6">
													<div className="category-list">
														<ul>
															{property.label && (
																<li>
																	<Link href={`/property-details-v1?id=${property.id}`}>{property.label}</Link>
																</li>
															)}
															<li>
																<Link href={`/property-details-v1?id=${property.id}`}>{property.status}</Link>
															</li>
														</ul>
													</div>
													<div className="content-area">
														<Link href={`/property-details-v1?id=${property.id}`}>{property.keyword}</Link>
														<div className="space18" />
														<p>
															<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
																<path d="M18.364 17.364L12 23.7279L5.63604 17.364C2.12132 13.8492 2.12132 8.15076 5.63604 4.63604C9.15076 1.12132 14.8492 1.12132 18.364 4.63604C21.8787 8.15076 21.8787 13.8492 18.364 17.364ZM12 15C14.2091 15 16 13.2091 16 11C16 8.79086 14.2091 7 12 7C9.79086 7 8 8.79086 8 11C8 13.2091 9.79086 15 12 15ZM12 13C10.8954 13 10 12.1046 10 11C10 9.89543 10.8954 9 12 9C13.1046 9 14 9.89543 14 11C14 12.1046 13.1046 13 12 13Z" />
															</svg>{" "}
															{property.address}, {property.city}, {property.state}
														</p>
														<div className="space24" />
														<ul>
															<li>
																<Link href="#">
																	<img src="/assets/img/icons/bed1.svg" alt="bed" />x{property.bedrooms}
																</Link>
															</li>
															<li>
																<Link href="#">
																	<img src="/assets/img/icons/bath1.svg" alt="bath" />x{property.bathrooms}
																</Link>
															</li>
															<li>
																<Link href="#">
																	<img src="/assets/img/icons/sqare1.svg" alt="size" />
																	{property.minSize} sq
																</Link>
															</li>
														</ul>
														<div className="btn-area">
															<div className="name-area">
																{property.agent && (
																	<>
																		<div className="img">
																			<img
																				src={
																					property.agent.image || "/assets/img/all-images/properties/property-img7.png"
																				}
																				alt="agent"
																			/>
																		</div>
																		<div className="text">
																			<Link href="#">{property.agent.name}</Link>
																		</div>
																	</>
																)}
															</div>
															<Link href="#" className="nm-btn">
																${property.minPrice.toLocaleString()}
															</Link>
														</div>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
							))
						) : (
							<div className="no-properties">
								<h4>No properties found matching your criteria</h4>
								<p>Try adjusting your filters to see more results</p>
							</div>
						)}
						{renderPagination()}
					</div>
				</div>
			</div>
		</>
	)
}

