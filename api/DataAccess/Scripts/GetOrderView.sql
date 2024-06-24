CREATE OR REPLACE VIEW orders.ordercartview AS
                    SELECT c.id,
                        c.orderid,
                        c.cartid,
                        ct.productid,
                        ct.quantity,
                        ct.datesofpayment,
                        ct.numberofinstallment,
                        ct.islayaway,
                        c.price,
                        c.onsale,
                        c.salesprice,
                        c.preorder,
                        ct.hasrushfee,
                        ct.rushfee,
                        c.origprice,
                        c.preorderlayaway,
                        COALESCE(c.isnotifsend, false) AS isnotifsend,
                        COALESCE((select rate from orders.orderproductreview rt 
                        where rt.orderid = c.orderid
                        and rt.parentid = 0
                        and rt.productid = ct.productid
                        limit 1
                        ), 0) rating,
                        (CASE WHEN EXISTS(select rate from orders.orderproductreview rt 
                        where rt.orderid = c.orderid
                        and rt.parentid = 0
                        and rt.productid = ct.productid
                        ) THEN true ELSE false END) hasReview
                        
                    FROM orders.ordercart c
                        LEFT JOIN cart.cart ct ON ct.id = c.cartid;





CREATE OR REPLACE VIEW orders.orderproductreviewview AS
 SELECT rw.id,
    rw.rate,
    rw.comment,
    rw.productid,
    rw.orderid,
    rw.activeuser,
    rw.parentid,
    us.name,
	rw.createddate
   FROM orders.orderproductreview rw
     JOIN application."user" us ON rw.activeuser = us.id;

ALTER TABLE orders.orderproductreviewview
    OWNER TO byzmo_admin;

GRANT ALL ON TABLE orders.orderproductreviewview TO byzmo_admin;
GRANT ALL ON TABLE orders.orderproductreviewview TO postgres;
GRANT DELETE, UPDATE, SELECT, INSERT ON TABLE orders.orderproductreviewview TO byzmo_user;



CREATE OR REPLACE FUNCTION orders.getorderproductreview(
	p_productid integer)
    RETURNS SETOF orders.orderproductreview 
    LANGUAGE 'plpgsql'

    COST 100
    VOLATILE 
    ROWS 1000
AS $BODY$
	BEGIN
		RETURN QUERY SELECT * 
		FROM orders.orderproductreview 
		WHERE productid = p_productid;
	END
$BODY$;





CREATE OR REPLACE VIEW product.productsview AS
 SELECT p.id,
    p.productname,
    p.productdescription,
        CASE
            WHEN p.quantity < 0 THEN 0
            ELSE p.quantity
        END AS quantity,
    p.price,
    p.isactive,
    p.category,
    p.tag,
    p.itemnumber,
    concat(replace(regexp_replace(p.productname, '[^a-zA-Z]'::text, ''::text, 'g'::text), ' '::text, ''::text), '-', p.id::text) AS linkname,
    p.onsale,
    p.salesprice,
    p.preorder,
    p.islayaway,
    p.preorderdepositamount,
    p.costprice,
    p.hasrushfee,
    p.rushfee,
    0::numeric AS sorting,
        CASE
            WHEN (( SELECT min(producttags.name) AS min
               FROM product.producttags
              WHERE producttags.productid = p.id)) ~~ '%just arrived%'::text THEN '1'::text
            WHEN (( SELECT min(producttags.name) AS min
               FROM product.producttags
              WHERE producttags.productid = p.id)) ~~ '%on hand%'::text THEN '2'::text
            WHEN (( SELECT min(producttags.name) AS min
               FROM product.producttags
              WHERE producttags.productid = p.id)) ~~ '%pre-order%'::text THEN '3'::text
            WHEN (( SELECT min(producttags.name) AS min
               FROM product.producttags
              WHERE producttags.productid = p.id)) ~~ '%on sale%'::text THEN '4'::text
            ELSE NULL::text
        END AS tagroup,
    p.isdeleted,
    p.preorderlayaway,
    p.create_date,
    p.modified_date,
	COALESCE(
		(select sum(rate) from orders.orderproductreviewview rw where rw.productid = p.id) / 
		(select count(1) from orders.orderproductreviewview rw where rw.productid = p.id)								
			, 0) rates
   FROM product.products p;

ALTER TABLE product.productsview
    OWNER TO postgres;

GRANT ALL ON TABLE product.productsview TO byzmo_admin;
GRANT ALL ON TABLE product.productsview TO postgres;
GRANT DELETE, UPDATE, SELECT, INSERT ON TABLE product.productsview TO byzmo_user;












CREATE OR REPLACE FUNCTION product.getproductslistrange(
	p_productname text,
	p_productdescription text,
	p_category text[],
	p_itemnumber text,
	p_tags text[],
	p_offset integer,
	p_limit integer,
	p_sortby text,
	p_forproductlist boolean)
    RETURNS SETOF product.productsview 
    LANGUAGE 'plpgsql'

    COST 100
    VOLATILE 
    ROWS 1000
AS $BODY$

DECLARE d_sortid integer;
BEGIN
	--legend
	
	d_sortid := (CASE 
					 WHEN LOWER(p_sortby) = LOWER('Coming Soon') THEN 1
					 WHEN LOWER(p_sortby) = LOWER('Name: A to Z') THEN 2
					 WHEN LOWER(p_sortby) = LOWER('Name: Z to A') THEN 3
					 WHEN LOWER(p_sortby) = LOWER('Price: Low to High') THEN 4
				 	 WHEN LOWER(p_sortby) = LOWER('Price: High to Low') THEN 5
				     ELSE 0 END); 
					 
	IF EXISTS(SELECT 1 FROM(SELECT UNNEST(p_tags) po) b
						WHERE LOWER(b.po) = 'pre order')
		THEN
			p_tags := (select array_append(p_tags, 'pre order layaway'));
		END IF;
	
	IF (p_forproductlist = true)
	THEN
			
			
	
			RETURN QUERY 
			SELECT id,
				   productname,
				   productdescription,
				   quantity,
				   price,
				   isactive,
				   category,
				   tag,
				   itemnumber,
				   linkname,
				   onsale,
				   salesprice,
				   preorder,
				   islayaway,
				   preorderdepositamount,
				   costprice,
				   hasrushfee,
				   rushfee,
				   ROW_NUMBER() OVER (ORDER BY 
					  tagroup ,		
					 (CASE WHEN p_sortby IS NULL OR COALESCE(d_sortid, 0) = 0 THEN coalesce(modified_date, create_date) END) DESC,
					 (CASE WHEN d_sortid = 1 THEN id END) DESC,
					 (CASE WHEN d_sortid = 2 THEN productname END ),
					 (CASE WHEN d_sortid = 3 THEN productname END ) DESC,
					 (CASE WHEN d_sortid = 4 THEN 
						(CASE WHEN onsale = true THEN salesprice ELSE price END)
					  END) ASC ,
					  (CASE WHEN d_sortid = 5 THEN 
						(CASE WHEN onsale = true THEN salesprice ELSE price END)
					  END) DESC
					) :: NUMERIC AS sorting,
					tagroup,
			isdeleted,
			preorderlayaway,
			create_date,
			modified_date,
			rates
			FROM product.productsview  
			WHERE (p_productname = '' OR (to_tsvector(productname) @@ plainto_tsquery(p_productname)) OR productname ILIKE CONCAT('%', p_productname, '%'))
			AND isactive = true
			--AND id = 2
			AND (p_productdescription = '' OR (to_tsvector(productdescription) @@ plainto_tsquery(p_productdescription)) OR productdescription ILIKE CONCAT('%', p_productdescription, '%'))
			AND (p_category IS NULL OR COALESCE(array_length(p_category, 1), 0) = 0 OR category ILIKE  ANY(p_category))
			AND (p_itemnumber = '' OR itemnumber ILIKE CONCAT('%', p_itemnumber, '%'))
			AND (p_tags IS NULL OR COALESCE(array_length(p_tags, 1), 0) = 0 OR (id IN (SELECT productid 
													   FROM product.producttagsview
													   WHERE (CASE WHEN name ILIKE '%Pre-Order%' THEN REPLACE(name,'-',' ') ELSE name END) 
																					   ILIKE ANY(p_tags))))
													   
		
			LIMIT p_limit
			OFFSET p_offset;
			
	ELSE 
	
		RETURN QUERY 
			SELECT id,
				   productname,
				   productdescription,
				   quantity,
				   price,
				   isactive,
				   category,
				   tag,
				   itemnumber,
				   linkname,
				   onsale,
				   salesprice,
				   preorder,
				   islayaway,
				   preorderdepositamount,
				   costprice,
				   hasrushfee,
				   rushfee,
				   ROW_NUMBER() OVER (ORDER BY 
					 (CASE WHEN p_sortby IS NULL OR COALESCE(d_sortid, 0) = 0 THEN isactive END) DESC,
					  tagroup ,	
					 (CASE WHEN p_sortby IS NULL OR COALESCE(d_sortid, 0) = 0 THEN coalesce(modified_date, create_date) END) DESC,
					 (CASE WHEN d_sortid = 1 THEN id END) DESC,
					 (CASE WHEN d_sortid = 2 THEN productname END ),
					 (CASE WHEN d_sortid = 3 THEN productname END ) DESC,
					 (CASE WHEN d_sortid = 4 THEN 
						(CASE WHEN onsale = true THEN salesprice ELSE price END)
					  END) ASC ,
					  (CASE WHEN d_sortid = 5 THEN 
						(CASE WHEN onsale = true THEN salesprice ELSE price END)
					  END) DESC
					) :: NUMERIC AS sorting,
					tagroup,
			isdeleted,
			preorderlayaway,
			create_date,
			modified_date,
			rates
			FROM product.productsview  
			WHERE (p_productname = '' OR (to_tsvector(productname) @@ plainto_tsquery(p_productname)) OR productname ILIKE CONCAT('%', p_productname, '%'))
			AND isdeleted = false
			--AND id = 2
			AND (p_productdescription = '' OR (to_tsvector(productdescription) @@ plainto_tsquery(p_productdescription)) OR productdescription ILIKE CONCAT('%', p_productdescription, '%'))
			AND (p_category IS NULL OR COALESCE(array_length(p_category, 1), 0) = 0 OR category ILIKE ANY(p_category))
			AND (p_itemnumber = '' OR itemnumber ILIKE CONCAT('%', p_itemnumber, '%'))
			AND (p_tags IS NULL OR COALESCE(array_length(p_tags, 1), 0) = 0 OR (id IN (SELECT productid 
													   FROM product.producttagsview
													   WHERE LOWER((CASE WHEN name ILIKE '%Pre-Order%' THEN REPLACE(name,'-',' ') ELSE name END))
																					   ILIKE ANY(p_tags))))
													   
		  
			LIMIT p_limit
			OFFSET p_offset;
	
	END IF;
	
END

$BODY$;

ALTER FUNCTION product.getproductslistrange(text, text, text[], text, text[], integer, integer, text, boolean)
    OWNER TO postgres;
	