CREATE SEQUENCE orders.orderproductreview_id_seq
    INCREMENT 1
    START 20
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1;

GRANT ALL ON SEQUENCE orders.orderproductreview_id_seq TO byzmo_admin;

GRANT ALL ON SEQUENCE orders.orderproductreview_id_seq TO postgres;

GRANT ALL ON SEQUENCE orders.orderproductreview_id_seq TO byzmo_user;



CREATE TABLE orders.orderproductreview
(
    id integer NOT NULL DEFAULT nextval('orders.orderproductreview_id_seq'::regclass),
    rate integer DEFAULT 0,
    comment text COLLATE pg_catalog."default",
    productid integer DEFAULT 0,
	orderid integer DEFAULT 0,
	activeuser integer DEFAULT 0,
	parentid integer DEFAULT 0,
    CONSTRAINT orderproductreview_pkey PRIMARY KEY (id)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;


GRANT ALL ON TABLE orders.orderproductreview TO byzmo_admin;

GRANT DELETE, INSERT, SELECT, UPDATE ON TABLE orders.orderproductreview TO byzmo_user;

GRANT ALL ON TABLE orders.orderproductreview TO postgres;


ALTER TABLE orders.orderproductreview
ADD COLUMN createddate timestamp with time zone;


CREATE OR REPLACE FUNCTION orders.createorderproductreview(
	p_rate integer,
	p_comment text,
	p_productid integer,
	p_orderid integer,
	p_activeuser integer,
	p_parentid integer)
    RETURNS SETOF orders.orderproductreview 
    LANGUAGE 'plpgsql'

    COST 100
    VOLATILE 
    ROWS 1000
AS $BODY$

DECLARE
	d_currentid integer;
BEGIN
	INSERT INTO orders.orderproductreview(rate, comment, productid, orderid, activeuser, parentid, createddate)
	VALUES(p_rate, p_comment, p_productid, p_orderid, p_activeuser, p_parentid, CURRENT_DATE) RETURNING id INTO d_currentid;
	
	
	RETURN QUERY SELECT * 
	FROM orders.orderproductreview 
	WHERE id = d_currentid;
	
END

$BODY$;



ALTER TABLE cart.cart
ADD COLUMN hasReview BOOLEAN DEFAULT false;

ALTER TABLE cart.cart
ADD COLUMN rating NUMERIC DEFAULT 0;


