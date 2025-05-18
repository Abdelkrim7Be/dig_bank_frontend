import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProductService } from './services/product.service';
import {
  Product,
  CreateProductDto,
  UpdateProductDto,
} from './models/product.model';
// Removed RouterLink since it's not used
import { ProductFormComponent } from './product-form/product-form.component';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    // Removed RouterLink
    ProductFormComponent,
  ],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  loading = false;
  error: string | null = null;

  // For modal functionality
  showModal = false;
  modalTitle = '';
  currentProduct: Product | null = null;
  isEditMode = false;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.error = null;

    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load products. Please try again later.';
        console.error('Error loading products:', err);
        this.loading = false;
      },
    });
  }

  openAddModal(): void {
    this.currentProduct = null;
    this.isEditMode = false;
    this.modalTitle = 'Add New Product';
    this.showModal = true;
  }

  openEditModal(product: Product): void {
    this.currentProduct = { ...product };
    this.isEditMode = true;
    this.modalTitle = 'Edit Product';
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.currentProduct = null;
  }

  saveProduct(productData: CreateProductDto | UpdateProductDto): void {
    if (this.isEditMode && this.currentProduct) {
      this.productService
        .updateProduct(this.currentProduct.id, productData)
        .subscribe({
          next: (updatedProduct) => {
            this.products = this.products.map((p) =>
              p.id === updatedProduct.id ? updatedProduct : p
            );
            this.closeModal();
          },
          error: (err) => {
            console.error('Error updating product:', err);
            this.error = 'Failed to update product. Please try again.';
          },
        });
    } else {
      this.productService
        .createProduct(productData as CreateProductDto)
        .subscribe({
          next: (newProduct) => {
            this.products.push(newProduct);
            this.closeModal();
          },
          error: (err) => {
            console.error('Error creating product:', err);
            this.error = 'Failed to create product. Please try again.';
          },
        });
    }
  }

  deleteProduct(id: number): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(id).subscribe({
        next: () => {
          this.products = this.products.filter((product) => product.id !== id);
        },
        error: (err) => {
          console.error('Error deleting product:', err);
          this.error = 'Failed to delete product. Please try again.';
        },
      });
    }
  }
}
